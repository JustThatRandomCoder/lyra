import { motion } from 'framer-motion'
import '../styles/home.css';

function Home() {
    return (
        <main>
            <h1 className='headline'>Create</h1>
            <div className='container'>
                <div className="usecase">
                    <div className="input-gradient-border">
                        <input placeholder="What is the playlist for?" />
                    </div>
                </div>
            </div>
            <div className="btn-container">
                <motion.button
                    whileHover={{
                        scale: 1.02,
                    }}
                    whileTap={{
                        scale: 0.97,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22
                    }}
                >
                    Next
                </motion.button>
            </div>
        </main>
    )
}

export default Home
