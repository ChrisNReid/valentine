import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'

function App() {
  const [yesClicked, setYesClicked] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 })
  const [noClickCount, setNoClickCount] = useState(0)
  const [noButtonFixed, setNoButtonFixed] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  
  const noButtonRef = useRef(null)
  const yesButtonRef = useRef(null)
  const buttonsContainerRef = useRef(null)
  const h1Ref = useRef(null)
  
  const noMessages = [
    "Are you sure you want to press that one?",
    "Really?",
    "Not quite...",
    "Almost there..",
    "I dare you",
    "I think you are mistaken",
    "WRONG",
    "Really? :(",
    "Try again!",
    "Nope, not that one!",
    "Keep trying!",
    "Almost got it!",
    "So close!",
    "Not the right button!",
    "Hmm, try the other one"
  ]

  // Initialize - buttons start next to each other in flex container (no positioning needed)

  // Function to check if a position overlaps with text or Yes button
  const isPositionValid = useCallback((x, y) => {
    if (!noButtonRef.current || !yesButtonRef.current || !h1Ref.current) {
      return true
    }
    
    const noButtonRect = noButtonRef.current.getBoundingClientRect()
    const buttonWidth = noButtonRect.width || 150
    const buttonHeight = noButtonRect.height || 50
    
    // Since button is now fixed, x and y are already in viewport coordinates
    const buttonViewportX = x
    const buttonViewportY = y
    
    // Check overlap with Yes button
    const yesRect = yesButtonRef.current.getBoundingClientRect()
    const yesLeft = yesRect.left
    const yesRight = yesRect.right
    const yesTop = yesRect.top
    const yesBottom = yesRect.bottom
    
    const buttonRight = buttonViewportX + buttonWidth
    const buttonBottom = buttonViewportY + buttonHeight
    
    // Check if button overlaps with Yes button (with some padding)
    const padding = 10
    if (
      buttonViewportX < yesRight + padding &&
      buttonRight > yesLeft - padding &&
      buttonViewportY < yesBottom + padding &&
      buttonBottom > yesTop - padding
    ) {
      return false
    }
    
    // Check overlap with h1 text
    const h1Rect = h1Ref.current.getBoundingClientRect()
    const h1Left = h1Rect.left
    const h1Right = h1Rect.right
    const h1Top = h1Rect.top
    const h1Bottom = h1Rect.bottom
    
    if (
      buttonViewportX < h1Right + padding &&
      buttonRight > h1Left - padding &&
      buttonViewportY < h1Bottom + padding &&
      buttonBottom > h1Top - padding
    ) {
      return false
    }
    
    return true
  }, [])

  // Get button bounds to keep it within viewport (now using fixed positioning)
  const getButtonBounds = useCallback(() => {
    if (!noButtonRef.current) {
      return { width: 150, height: 50, maxX: window.innerWidth - 170, maxY: window.innerHeight - 70, minX: 20, minY: 20 }
    }
    
    const buttonRect = noButtonRef.current.getBoundingClientRect()
    const buttonWidth = buttonRect.width || 150
    const buttonHeight = buttonRect.height || 50
    const padding = 20
    
    // Since button is now fixed, use viewport coordinates directly
    return {
      width: buttonWidth,
      height: buttonHeight,
      maxX: window.innerWidth - buttonWidth - padding,
      maxY: window.innerHeight - buttonHeight - padding,
      minX: padding,
      minY: padding
    }
  }, [])
  
  // Function to move button to a random valid position
  const moveButtonToRandomPosition = useCallback(() => {
    const bounds = getButtonBounds()
    let attempts = 0
    let newX, newY
    let isValid = false
    
    // Try to find a valid position (max 50 attempts)
    while (!isValid && attempts < 50) {
      newX = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX
      newY = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY
      isValid = isPositionValid(newX, newY)
      attempts++
    }
    
    // If we couldn't find a valid position after 50 attempts, use the bounds anyway
    if (!isValid) {
      newX = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX
      newY = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY
    }
    
    setNoButtonPos({ x: newX, y: newY })
  }, [getButtonBounds, isPositionValid])


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const bounds = getButtonBounds()
      setNoButtonPos(prev => ({
        x: Math.max(bounds.minX, Math.min(prev.x, bounds.maxX)),
        y: Math.max(bounds.minY, Math.min(prev.y, bounds.maxY))
      }))
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getButtonBounds])

  // Create confetti
  const createConfetti = useCallback(() => {
    const colors = [
      '#a864fd', // (168,100,253)
      '#29cdff', // (41,205,255)
      '#78ff44', // (120,255,68)
      '#ff718d', // (255,113,141)
      '#fdff6a'  // (253,255,106)
    ]
    const confettiCount = 150
    const newConfetti = []

    for (let i = 0; i < confettiCount; i++) {
      const confettiPiece = {
        id: Date.now() + i,
        left: Math.random() * 100,
        top: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 0.5
      }
      newConfetti.push(confettiPiece)
    }

    setConfetti(prev => [...prev, ...newConfetti])

    // Remove confetti after animation
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.includes(c)))
    }, 5000)
  }, [])

  // Handle yes button click
  const handleYesClick = () => {
    setYesClicked(true)
    setShowCelebration(true)
    createConfetti()
    
    // Keep creating confetti periodically
    const confettiInterval = setInterval(() => {
      createConfetti()
    }, 2000)

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(confettiInterval)
    }, 10000)
  }

  // Handle no button click/touch - move to random position and update message
  const handleNoClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setNoClickCount(prev => prev + 1)
    
    // On first click, switch to fixed positioning
    if (!noButtonFixed) {
      setNoButtonFixed(true)
      // Get current position in viewport coordinates
      if (noButtonRef.current) {
        const rect = noButtonRef.current.getBoundingClientRect()
        setNoButtonPos({ x: rect.left, y: rect.top })
      }
    }
    
    moveButtonToRandomPosition()
  }
  
  const handleNoTouchStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setNoClickCount(prev => prev + 1)
    
    // On first touch, switch to fixed positioning
    if (!noButtonFixed) {
      setNoButtonFixed(true)
      // Get current position in viewport coordinates
      if (noButtonRef.current) {
        const rect = noButtonRef.current.getBoundingClientRect()
        setNoButtonPos({ x: rect.left, y: rect.top })
      }
    }
    
    moveButtonToRandomPosition()
  }
  
  // Get current message based on click count
  const getCurrentMessage = () => {
    if (noClickCount === 0) return ""
    const messageIndex = (noClickCount - 1) % noMessages.length
    return noMessages[messageIndex]
  }

  return (
    <div className="container">
      <h1 ref={h1Ref}>Deffy, will you be my Valentine?</h1>
      <div ref={buttonsContainerRef} className="buttons-container">
        {!yesClicked && (
          <button ref={yesButtonRef} className="yes-button" onClick={handleYesClick}>
            Yes
          </button>
        )}
        {!yesClicked && (
          <button
            ref={noButtonRef}
            className={`no-button ${noButtonFixed ? 'fixed' : ''}`}
            onClick={handleNoClick}
            onTouchStart={handleNoTouchStart}
            style={noButtonFixed ? {
              left: `${noButtonPos.x}px`,
              top: `${noButtonPos.y}px`
            } : {}}
          >
            No
          </button>
        )}
      </div>
      {showCelebration && (
        <>
          <div className="celebration-image">
            <img 
              src="/valentine/cute2.gif"
              alt="Two teddy bears hugging"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '💕💖💕'
              }}
            />
          </div>
          <div className="celebration">🎉 Wooohoooo! 🎉</div>
          <button className="find-out-button" onClick={() => {
            setShowPlanModal(true)
          }}>
            Find out what we will do here
          </button>
        </>
      )}

      {showPlanModal && (
        <div className="plan-modal-backdrop" onClick={() => setShowPlanModal(false)}>
          <div
            className="plan-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="plan-modal-close"
              onClick={() => setShowPlanModal(false)}
              aria-label="Close plan"
            >
              ✕
            </button>
            <div className="plan-modal-photos plan-modal-photos-top">
              <img src="/valentine/IMG_9911.JPG" alt="Us together" />
              <img src="/valentine/IMG_9652.JPG" alt="Smiling together" />
              <img src="/valentine/IMG_6489.jpeg" alt="Cute selfie" />
            </div>
            <h2 className="plan-modal-title">Our Valentine&apos;s Night Plan 💕</h2>
            <p className="plan-modal-subtitle">
              A cozy, home-cooked date night by me, just for you.
            </p>
            <div className="plan-modal-section">
              <h3>1. Three-Course Home-Cooked Dinner</h3>
              <ul>
                <li><span>Starter:</span> Light snacks</li>
                <li><span>Main:</span> A warm, comforting main course</li>
                <li><span>Dessert:</span> Something sweet, like you</li>
              </ul>
            </div>
            <div className="plan-modal-section">
              <h3>2. Cocktails Together</h3>
              <p>
                We&apos;ll mix up some cocktails, a little at home bar.
              </p>
            </div>
            <div className="plan-modal-section">
              <h3>3. Build a Fort &amp; Movie Night</h3>
              <p>
                We&apos;ll build a cozy blanket fort, grab all the pillows, matching sets,
                and movie night.
              </p>
            </div>
            <div className="plan-modal-photos plan-modal-photos-bottom">
              <img src="/valentine/IMG_6475.jpeg" alt="Another cozy moment" />
              <img src="/valentine/grad-41__01.jpg" alt="Graduation memory" />
              <img src="/valentine/DSC03277.JPG" alt="Another favorite moment" />
            </div>
          </div>
        </div>
      )}

      {!yesClicked && noClickCount > 0 && (
        <div className="no-message">{getCurrentMessage()}</div>
      )}
      
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            top: `${piece.top}px`,
            background: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`
          }}
        />
      ))}
    </div>
  )
}

export default App
