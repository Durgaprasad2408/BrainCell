import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/logo2.png';

const Footer = () => {
    return (
        <footer className="px-6 pt-8 bg-black md:px-16 lg:px-36 w-full text-white">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
                <div className="md:max-w-96">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="" srcset="" className='h-16' />
                    </div>
                    <p className="mt-6 text-sm text-gray-300">
                        Empowering students with personalized learning experiences. Our intelligent platform adapts to your learning style, pace, and goals to help you master complex concepts and achieve academic excellence.
                    </p>

                </div>
                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Platform</h2>
                        <ul className="text-sm space-y-2">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About BrainCell</Link></li>
                            <li><Link to="/student/playgrounds">Learning Playgrounds</Link></li>
                            <li><Link to="/student/learning">Courses</Link></li>
                            <li><Link to="/student/challenges">Challenges</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Support</h2>
                        <div className="text-sm space-y-2">
                            <p>support@braincell.com</p>
                            <p>help@braincell.com</p>
                            <p>+1-800-BRAINCELL</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5 text-gray-400">
                Copyright {new Date().getFullYear()} © <span className="text-indigo-400 font-semibold">BrainCell</span>. All Rights Reserved. Empowering personalized learning.
            </p>
        </footer>
    )
}

export default Footer;