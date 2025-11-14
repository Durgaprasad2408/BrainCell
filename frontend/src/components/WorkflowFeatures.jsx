import React from "react";

const workflowSteps = [
  {
    step: "1",
    title: "Register",
    desc: "Create your free account in seconds and unlock the platform.",
  },
  {
    step: "2",
    title: "Enroll in a Subject",
    desc: "Browse hundreds of topics and pick the ones that fit your goals.",
  },
  {
    step: "3",
    title: "Complete the Modules",
    desc: "Follow bite-sized lessons with videos, quizzes, and hands-on labs.",
  },
  {
    step: "4",
    title: "Learn the Subject",
    desc: "Master concepts at your own pace with progress tracking.",
  },
  {
    step: "5",
    title: "Participate in Challenges",
    desc: "Test your skills in real-world scenarios and compete with peers.",
  },
  {
    step: "6",
    title: "Earn Badges",
    desc: "Collect achievements, showcase them, and boost your profile.",
  },
];

const WorkflowFeatures = () => {
  return (
    <section className="relative py-24 bg-black text-white overflow-hidden">
      {/* Optional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-4 bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
          Your Learning Journey – Step by Step
        </h2>
        <p className="text-slate-300 text-center max-w-2xl mx-auto mb-16">
          Follow a clear, rewarding path from sign-up to mastery.
        </p>

        {/* Desktop – Horizontal Flow with Arrow Connectors */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-wrap">
          {workflowSteps.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center max-w-xs">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-slate-400 text-center text-sm">{item.desc}</p>
              </div>

              {/* Arrow connector – hide on last item */}
              {idx < workflowSteps.length - 1 && (
                <svg
                  className="w-12 h-12 text-indigo-500 hidden lg:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 12h14"
                  />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile – Vertical Stacked Cards */}
        <div className="md:hidden space-y-12">
          {workflowSteps.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WorkflowFeatures;