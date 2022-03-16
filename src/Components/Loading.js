import React from 'react'
import LoadingOverlay from 'react-loading-overlay';

export default function Loading() {
  return (
    <LoadingOverlay
        active={true}
        spinner
        text="Loading..."
        styles={{
          wrapper: {
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          },
          
        }}>

        </LoadingOverlay>
  )
}
