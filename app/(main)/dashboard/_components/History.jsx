import React from 'react'

function History( {children} ) {
  return (
    <div>
        <h2 className='font-bold text-xl'>Your Previous Lecture</h2>
        <h2 className='text-gray-500'>You don't have any previous lectures</h2>
    </div>
  )
}

export default History