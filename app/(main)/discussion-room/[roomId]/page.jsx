"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { useUser } from "@stackframe/stack";
import { CoachingExpert } from "@/services/Options";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import RecordRTC from "recordrtc";
import { StreamingTranscriber } from "assemblyai";
import { getToken, AIModel } from "@/services/GlobalServices";

function DiscussionRoom() {
  const roomId = useParams().roomId;
  const discussionRoomData = useQuery(api.DiscussionRoom.getDiscussionRoom, { id: roomId });
  const [expert, setExpert] = useState(null);
  const [enableMic, setEnableMic] = useState(false);
  const user = useUser();

  // Core refs
  const recorder = useRef(null);
  const transcriber = useRef(null);
  const chatContainerRef = useRef(null);
  const lastMessageEndRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  
  // Control refs
  const processingResponseRef = useRef(false);
  const isListeningPausedRef = useRef(false);
  
  // Deduplication: track last finalized text with timestamp
  const lastFinalizedRef = useRef({ text: "", timestamp: 0 });

  // Conversation state - single source of truth
  const [conversationHistory, setConversationHistory] = useState([]);
  const [livePartial, setLivePartial] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Load expert data
  useEffect(() => {
    if (discussionRoomData) {
      const foundExpert = CoachingExpert.find((item) => item.name === discussionRoomData.expertName);
      setExpert(foundExpert);
    }
  }, [discussionRoomData]);

  // Auto-scroll on conversation updates
  useEffect(() => {
    const timer = setTimeout(() => {
      lastMessageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(timer);
  }, [conversationHistory, livePartial, isAssistantTyping]);

  // Simple text normalization for deduplication
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  };

  // Build clean history for AI (filter out empty messages)
  const buildAIHistory = useCallback((history) => {
    return history
      .filter(msg => msg.content.trim().length > 0)
      .map(msg => ({
        role: msg.role === "Assistant" ? "assistant" : "user",
        content: msg.content
      }));
  }, []);

  // Pause/resume listening
  const pauseListening = useCallback(() => {
    isListeningPausedRef.current = true;
    setConnectionStatus("Connected — Paused");
  }, []);

  const resumeListening = useCallback(() => {
    isListeningPausedRef.current = false;
    setConnectionStatus("Connected");
  }, []);

  // Animated typing effect for assistant response
  const typeOutAssistant = useCallback((fullText) => {
    return new Promise((resolve) => {
      if (!fullText) {
        resolve();
        return;
      }

      const tokens = fullText.match(/\s+|\S+/g) || [];
      let currentIndex = 0;

      // Add empty assistant message
      setConversationHistory(prev => [...prev, { role: "Assistant", content: "" }]);
      setIsAssistantTyping(true);

      const interval = setInterval(() => {
        currentIndex++;
        
        setConversationHistory(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === "Assistant") {
            lastMsg.content = tokens.slice(0, currentIndex).join("");
          }
          return updated;
        });

        if (currentIndex >= tokens.length) {
          clearInterval(interval);
          setIsAssistantTyping(false);
          resolve();
        }
      }, 25);
    });
  }, []);

  // Handle AI response - now properly memoized to prevent duplicate calls
  const handleAIResponse = useCallback(async (userMessage, currentHistory) => {
    // Guard: if already processing, don't start another request
    if (processingResponseRef.current) {
      console.log("⏭️ Already processing, skipping duplicate AI call");
      return;
    }

    try {
      if (!discussionRoomData?.topic || !discussionRoomData?.coachingOption) {
        processingResponseRef.current = false;
        return;
      }

      // Mark as processing IMMEDIATELY
      processingResponseRef.current = true;
      pauseListening();
      setIsAssistantTyping(true);

      // Build clean history for AI
      const aiHistory = buildAIHistory(currentHistory);

      console.log("🤖 Getting AI response for:", userMessage);

      // Call AI model
      const completion = await AIModel(
        discussionRoomData.topic,
        discussionRoomData.coachingOption,
        userMessage,
        aiHistory
      );

      let assistantText = completion?.response?.content || "I'm here. Could you please repeat that?";

      // Type out the response
      await typeOutAssistant(assistantText);
      console.log("✅ AI response completed");

    } catch (err) {
      console.error("AI response error:", err);
      setConversationHistory(prev => [
        ...prev,
        { role: "Assistant", content: "Sorry, I had trouble responding. Please try again." }
      ]);
      setIsAssistantTyping(false);
    } finally {
      processingResponseRef.current = false;
      if (transcriber.current) {
        resumeListening();
      }
    }
  }, [discussionRoomData, buildAIHistory, pauseListening, resumeListening, typeOutAssistant]);

  const connectToServer = async () => {
    setIsConnecting(true);
    setConnectionStatus("Connecting...");
    isListeningPausedRef.current = false;
    processingResponseRef.current = false;

    try {
      const token = await getToken();
      if (!token) throw new Error("Failed to get AssemblyAI token");

      // Initialize transcriber with 5s silence threshold
      transcriber.current = new StreamingTranscriber({
        token,
        sampleRate: 16000,
        endUtteranceSilenceThreshold: 5000,
      });

      // Session opened
      transcriber.current.on("open", ({ id }) => {
        console.log("✅ Realtime session opened", id);
        setConnectionStatus("Connected");
        setEnableMic(true);
        setIsConnecting(false);
        isListeningPausedRef.current = false;
        lastFinalizedRef.current = { text: "", timestamp: 0 };
      });

      // Handle transcription turns
      transcriber.current.on("turn", (payload) => {
        try {
          const partialText = (payload?.utterance || payload?.transcript || "").trim();
          const isFinal = !!payload?.end_of_turn;
          const finalText = isFinal ? (payload?.transcript || "").trim() : "";

          // Update live partial as user speaks
          if (partialText && !isFinal) {
            setLivePartial(partialText);
          }

          // Process final text when turn ends
          if (isFinal && finalText) {
            // Guard: don't process if already handling a response
            if (processingResponseRef.current) {
              console.log("⏭️ Already processing response, ignoring new turn");
              return;
            }

            const now = Date.now();
            const normalized = normalizeText(finalText);
            
            // Deduplication: ignore if same text within 3 seconds
            if (
              normalized === normalizeText(lastFinalizedRef.current.text) &&
              now - lastFinalizedRef.current.timestamp < 3000
            ) {
              console.log("⏭️ Skipping duplicate:", finalText);
              return;
            }

            // Update dedup tracker
            lastFinalizedRef.current = { text: finalText, timestamp: now };
            
            // Clear live partial
            setLivePartial("");
            
            // Add user message
            setConversationHistory(prev => {
              const updated = [...prev, { role: "User", content: finalText }];
              
              // Trigger AI response OUTSIDE of state update using setTimeout
              // This prevents React StrictMode from calling it twice
              setTimeout(() => {
                handleAIResponse(finalText, updated);
              }, 0);
              
              return updated;
            });
          }
        } catch (err) {
          console.error("Turn handling error:", err);
        }
      });

      // Error handling
      transcriber.current.on("error", (err) => {
        console.error("StreamingTranscriber error:", err);
        setConnectionStatus("Error: " + (err?.message || "unknown"));
        setEnableMic(false);
        setIsConnecting(false);
      });

      // Close handling
      transcriber.current.on("close", (code, reason) => {
        console.log("🔴 Transcriber closed:", code, reason);
        setConnectionStatus("Disconnected");
        setEnableMic(false);
        setIsConnecting(false);
      });

      // Connect transcriber
      await transcriber.current.connect();
      console.log("Connected to AssemblyAI realtime");

      // Setup microphone with audio processing
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = rawStream;

      // Create audio processing pipeline
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(rawStream);

      // High-pass filter to remove low-frequency noise
      const hpFilter = audioCtx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.value = 120;

      // Compressor for vocal consistency
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(6, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      // Simple noise gate
      const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
      const gateThreshold = 0.01;
      
      scriptNode.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const output = event.outputBuffer.getChannelData(0);

        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < input.length; i++) {
          sum += input[i] * input[i];
        }
        const rms = Math.sqrt(sum / input.length);

        // Gate: mute if below threshold
        if (rms < gateThreshold) {
          output.fill(0);
        } else {
          output.set(input);
        }
      };

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.0;

      const destination = audioCtx.createMediaStreamDestination();

      // Connect audio graph
      source.connect(hpFilter);
      hpFilter.connect(compressor);
      compressor.connect(scriptNode);
      scriptNode.connect(gainNode);
      gainNode.connect(destination);

      // Start recording with RecordRTC
      recorder.current = new RecordRTC(destination.stream, {
        type: "audio",
        mimeType: "audio/webm;codecs=pcm",
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: async (blob) => {
          if (!transcriber.current || isListeningPausedRef.current) return;
          
          try {
            const buffer = await blob.arrayBuffer();
            transcriber.current.sendAudio(buffer);
          } catch (err) {
            console.error("Error sending audio chunk:", err);
          }
        },
      });

      recorder.current.startRecording();
      console.log("🎙️ Recording started");
      
    } catch (err) {
      console.error("connectToServer error:", err);
      setConnectionStatus("Error: " + (err?.message || "connection failed"));
      setEnableMic(false);
      setIsConnecting(false);
    }
  };

  const stopAndReleaseMedia = () => {
    // Stop recorder
    if (recorder.current) {
      try {
        recorder.current.stopRecording(() => {
          recorder.current?.stream?.getTracks().forEach(t => t.stop());
          recorder.current = null;
        });
      } catch {
        recorder.current = null;
      }
    }

    // Stop raw media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const disconnect = async () => {
    console.log("Disconnecting...");
    setConnectionStatus("Disconnecting...");

    try {
      stopAndReleaseMedia();

      if (transcriber.current) {
        await transcriber.current.close();
        transcriber.current = null;
      }
    } catch (err) {
      console.error("disconnect error:", err);
    } finally {
      setEnableMic(false);
      setConnectionStatus("Disconnected");
      setLivePartial("");
      processingResponseRef.current = false;
      isListeningPausedRef.current = false;
      lastFinalizedRef.current = { text: "", timestamp: 0 };
      setIsConnecting(false);
      setIsAssistantTyping(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="-mt-12 min-h-screen bg-white px-4 pt-8">
      <h2 className="text-xl font-bold mb-6">Topic Base Lecture</h2>

      {/* Connection Status */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <span className="font-semibold">Status:</span> {connectionStatus}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Expert Card */}
        <div className="lg:col-span-2 h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative">
          {expert?.avatar ? (
            <Image
              src={expert.avatar}
              alt="Avatar"
              width={200}
              height={200}
              className="h-[80px] w-[80px] rounded-full object-cover animate-pulse"
            />
          ) : (
            <div className="h-[80px] w-[80px] rounded-full bg-gray-300 animate-pulse" />
          )}
          <h2 className="text-gray-500 mt-2">{expert?.name || "Loading..."}</h2>
          <div className="p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10">
            <UserButton />
          </div>
        </div>

        {/* Chat Section */}
        <div
          ref={chatContainerRef}
          className="h-[60vh] bg-secondary border rounded-4xl flex flex-col p-4 overflow-y-auto"
        >
          <h2 className="font-semibold mb-4">Chat Section</h2>
          <div className="flex-1 space-y-2">
            {conversationHistory.length === 0 && !livePartial && (
              <p className="text-gray-400 text-sm">No messages yet. Start speaking...</p>
            )}

            {/* Conversation messages */}
            {conversationHistory.map((msg, index) => {
              const isUser = msg.role === "User";
              const userAvatarSrc = user?.profileImageUrl || "/eduvi-logo.png";
              const avatarSrc = isUser ? userAvatarSrc : expert?.avatar || "/t1.avif";
              
              return (
                <div key={index} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  {isUser ? (
                    <img
                      src={avatarSrc}
                      alt="You avatar"
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <Image
                      src={avatarSrc}
                      alt={`${msg.role} avatar`}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={`p-2 rounded-lg max-w-[80%] ${isUser ? "bg-blue-50" : "bg-white"}`}>
                    <span className="font-semibold text-sm">
                      {isUser ? "You" : expert?.name || "Assistant"}:
                    </span>{" "}
                    <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                  </div>
                </div>
              );
            })}

            {/* Live partial (user speaking) */}
            {livePartial && (
              <div className="flex items-start gap-3 flex-row-reverse">
                <img
                  src={user?.profileImageUrl || "/eduvi-logo.png"}
                  alt="You"
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="p-2 bg-blue-50 rounded-lg border-2 border-blue-200 border-dashed max-w-[80%]">
                  <span className="font-semibold text-sm text-blue-700">You (speaking):</span>{" "}
                  <span className="text-sm text-blue-900">{livePartial}</span>
                </div>
              </div>
            )}

            {/* Assistant typing indicator */}
            {isAssistantTyping && conversationHistory[conversationHistory.length - 1]?.role !== "Assistant" && (
              <div className="flex items-start gap-3">
                <Image
                  src={expert?.avatar || "/t1.avif"}
                  alt="Assistant"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0 animate-pulse"
                />
                <div className="p-2 bg-gray-100 rounded-lg max-w-[80%]">
                  <span className="font-semibold text-sm">{expert?.name || "Assistant"}:</span>{" "}
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={lastMessageEndRef} />
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="w-full flex items-center justify-center mt-8 gap-4">
        {!enableMic && !isConnecting ? (
          <Button onClick={connectToServer}>Connect</Button>
        ) : isConnecting ? (
          <Button disabled>Connecting...</Button>
        ) : (
          <Button variant="destructive" onClick={disconnect}>
            Disconnect
          </Button>
        )}
      </div>

      <div className="w-full flex items-center justify-center mb-0 mt-2">
        <p className="text-xs text-gray-400 text-center max-w-lg mb-0">
          At the end of your conversation we will automatically generate feedback/notes from your conversation
        </p>
      </div>
    </div>
  );
}

export default DiscussionRoom;