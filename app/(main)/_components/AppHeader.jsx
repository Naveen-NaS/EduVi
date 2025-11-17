import { UserButton } from '@stackframe/stack'
import React from 'react'
import Image from 'next/image'

function AppHeader( {children} ) {
  return (
    <div className='p-3 flex justify-between item-center'>
        <Image src="/eduvi-logo.png" alt="Eduvi Logo" width={100} height={100} />

        <UserButton />
    </div>
  )
}

export default AppHeader