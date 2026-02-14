import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gmu-green to-green-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Welcome to <span className="text-gmu-gold">ConnectEd</span>
          </h1>
          <p className="text-2xl mb-12">The GMU Student Connection Platform</p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold mb-3">Connect with Alumni</h3>
              <p className="mb-4">Network with GMU graduates working at top tech companies</p>
              <Link to="/alumni" className="text-gmu-green font-semibold hover:underline">
                Browse Alumni →
              </Link>
            </div>
            
            <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-3">Find Tutors</h3>
              <p className="mb-4">Get help from top-performing students in your courses</p>
              <Link to="/tutors" className="text-gmu-green font-semibold hover:underline">
                Find Tutors →
              </Link>
            </div>
            
            <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Matching</h3>
              <p className="mb-4">Smart tutor matching using Groq AI for best results</p>
              <Link to="/help-requests" className="text-gmu-green font-semibold hover:underline">
                Request Help →
              </Link>
            </div>
          </div>

          {!user && (
            <div className="mt-16">
              <Link to="/register" className="bg-gmu-gold text-gmu-green px-8 py-4 rounded-lg text-xl font-bold hover:bg-yellow-400 inline-block">
                Get Started Today
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
