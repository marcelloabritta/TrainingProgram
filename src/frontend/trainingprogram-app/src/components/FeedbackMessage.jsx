import React from 'react'

function FeedbackMessage({message, isError}) {
    if(!message) {
        return null
    }

    const textColor = isError? "text-red-500" : "text-green-500";
  return (
    <p className={`text-xs font-semibold ${textColor}`}>
        {message}
    </p>
  )
}

export default FeedbackMessage
