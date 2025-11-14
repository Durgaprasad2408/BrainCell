import React from 'react';

const About = () => {
  // ---------- Hover-gradient card ----------
  const [visible, setVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const divRef = React.useRef(null); // ← No TypeScript

  const handleMouseMove = (e) => { // ← No type annotation
    const bounds = divRef.current?.getBoundingClientRect();
    if (bounds) {
      setPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    }
  };

  // ---------- FAQ accordion ----------
  const [openIdx, setOpenIdx] = React.useState(null);
  const toggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);

  const faqs = [
    {
      q: 'What is BrainCell?',
      a: 'BrainCell is an intelligent personalized learning platform that adapts to each student\'s learning style, pace, and goals to provide customized educational experiences.',
    },
    {
      q: 'Is BrainCell free to use?',
      a: 'Yes – BrainCell offers a free tier with access to basic learning features. Premium features are available for advanced personalized learning experiences.',
    },
    {
      q: 'How does personalized learning work?',
      a: 'Our AI analyzes your learning patterns, strengths, and areas for improvement to create custom learning paths, adjust difficulty levels, and recommend the most effective study methods for you.',
    },
    {
      q: 'What subjects does BrainCell cover?',
      a: 'BrainCell specializes in computer science education, including automata theory, algorithms, data structures, and programming concepts with interactive playgrounds and simulations.',
    },
    {
      q: 'How do I get support?',
      a: 'Contact our support team at support@braincell.com or help@braincell.com. We typically respond within 24 hours and offer priority support for premium users.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-slate-200 pt-20">
      {/* ---------- Existing Hover Card ---------- */}
      <div className="flex justify-center items-center py-12 px-4">
        <div
          ref={divRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="relative max-w-6xl w-full rounded-xl p-px bg-gray-900 backdrop-blur-md overflow-hidden shadow-2xl cursor-pointer"
        >
          {/* Gradient Hover Effect */}
          <div
            className={`pointer-events-none blur-3xl rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-300 size-60 absolute z-0 transition-opacity duration-500 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ top: position.y - 120, left: position.x - 120 }}
          />

          {/* Main Content */}
          <div className="relative z-10 bg-gray-900/75 rounded-2xl flex flex-col md:flex-row items-center justify-center p-8 gap-10">
            {/* Image Section */}
            <div className="relative shadow-2xl shadow-indigo-600/40 rounded-2xl overflow-hidden shrink-0">
              <img
                className="max-w-md w-full object-cover rounded-2xl"
                src="../../public/photo.jpg"
                alt="About"
              />
            </div>

            {/* Text Section */}
            <div className="text-sm max-w-lg">
              <h1 className="text-xl uppercase font-semibold text-white">
                What we do?
              </h1>
              <div className="w-24 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 to-[#DDD9FF] mt-2" />
              <p className="mt-8 text-slate-300">
                BrainCell revolutionizes education by providing personalized learning
                experiences that adapt to each student's unique pace, style, and goals.
              </p>
              <p className="mt-4 text-slate-300">
                Whether you're mastering computer science concepts, exploring automata theory,
                or diving into complex algorithms, our intelligent platform creates custom
                learning paths that maximize your understanding and retention.
              </p>
              <p className="mt-4 text-slate-300">
                From interactive playgrounds to adaptive assessments, BrainCell
                empowers students to learn effectively and achieve academic excellence.
              </p>
              <button className="flex items-center gap-2 mt-8 hover:-translate-y-0.5 transition bg-gradient-to-r from-indigo-600 to-[#8A7DFF] py-3 px-8 rounded-full text-white">
                <span>Read more</span>
                <svg
                  width="13"
                  height="12"
                  viewBox="0 0 13 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.53 6.53a.75.75 0 0 0 0-1.06L7.757.697a.75.75 0 1 0-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM0 6v.75h12v-1.5H0z"
                    fill="#fff"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== NEW SECTIONS ==================== */}

      {/* ---------- Mission & Vision ---------- */}
      <section className="py-16 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="relative p-8 bg-gray-900 rounded-2xl shadow-xl border border-indigo-600/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent rounded-2xl" />
            <h2 className="relative text-2xl font-bold text-indigo-400 mb-4">
              Our Mission
            </h2>
            <p className="relative text-slate-300 leading-relaxed">
              To democratize quality education by delivering personalized,
              adaptive learning experiences that cater to every student's unique
              learning style, pace, and academic goals, ensuring no one is left behind
              in their educational journey.
            </p>
          </div>

          {/* Vision */}
          <div className="relative p-8 bg-gray-900 rounded-2xl shadow-xl border border-purple-600/20">
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-2xl" />
            <h2 className="relative text-2xl font-bold text-purple-400 mb-4">
              Our Vision
            </h2>
            <p className="relative text-slate-300 leading-relaxed">
              A world where every student, regardless of their background or learning
              challenges, can access personalized education that adapts to their needs,
              unlocking their full potential and creating a more educated, innovative society.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FAQs ---------- */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-medium text-white hover:bg-gray-700/50 transition"
                >
                  <span>{item.q}</span>
                  <svg
                    className={`size-5 transition-transform ${
                      openIdx === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {openIdx === idx && (
                  <div className="px-5 pb-5 text-slate-300">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;