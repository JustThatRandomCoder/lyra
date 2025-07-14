import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/briefing.css';

const sectionVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
    exit: { opacity: 0, y: -40, transition: { duration: 0.4 } }
}

const childVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function Briefing() {
    const [step, setStep] = useState(0)
    const navigate = useNavigate()

    const handleNext = () => {
        if (step < 2) {
            setStep(s => s + 1)
        } else {
            navigate('/home')
        }
    }

    return (
        <main>
            <div className="section-container">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.section
                            key="first"
                            className="section"
                            variants={sectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.h1 variants={childVariants}>
                                Easily create a Playlist with the click of a Button
                            </motion.h1>
                        </motion.section>
                    )}
                    {step === 1 && (
                        <motion.section
                            key="second"
                            className="section"
                            variants={sectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.h1 variants={childVariants}>
                                Just tell us what you are looking for
                            </motion.h1>
                            <motion.div className='tags' variants={childVariants}>
                                <div className="tag">
                                    <span>🏋️</span><span>workout</span>
                                </div>
                                <div className="tag">
                                    <span>👔</span><span>work</span>
                                </div>
                                <div className="tag">
                                    <span>📚</span><span>studying</span>
                                </div>
                            </motion.div>
                            <motion.h1 variants={childVariants}>
                                ... we'll do the rest
                            </motion.h1>
                        </motion.section>
                    )}
                    {step === 2 && (
                        <motion.section
                            key="third"
                            className="section"
                            variants={sectionVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <motion.h1 variants={childVariants}>
                                Connect to Spotify or Apple Music
                            </motion.h1>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
            <div className="btn-container">
                {step === 2 && (
                    <motion.button
                        className="skip-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        onClick={() => navigate('/home')}
                    >
                        Skip
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    onClick={handleNext}
                >
                    Next
                </motion.button>
            </div>
        </main>
    )
}

export default Briefing
