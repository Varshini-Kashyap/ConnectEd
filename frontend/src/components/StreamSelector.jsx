import { useNavigate } from 'react-router-dom';

export default function StreamSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gmu-green mb-4">
          Choose Your Path
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Select how you'd like to connect today
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            onClick={() => navigate('/career')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-2"
          >
            <div className="text-6xl mb-4 text-center">🎓</div>
            <h2 className="text-3xl font-bold text-gmu-green mb-4 text-center">
              Connect for Career
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Network with GMU alumni working at top companies. Get career advice, mentorship, and industry insights.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                Browse alumni by company & major
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                AI-powered match scores
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                Send connection requests
              </li>
            </ul>
            <button className="w-full bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700">
              Explore Alumni Network
            </button>
          </div>

          <div
            onClick={() => navigate('/student')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition transform hover:-translate-y-2"
          >
            <div className="text-6xl mb-4 text-center">📚</div>
            <h2 className="text-3xl font-bold text-gmu-green mb-4 text-center">
              Find Academic Help
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Connect with peer tutors who excel in your courses. Get help with assignments, projects, and exam prep.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                Find tutors by course
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                AI-matched tutor recommendations
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-gmu-gold mr-2">✓</span>
                Post help requests
              </li>
            </ul>
            <button className="w-full bg-gmu-green text-white py-3 rounded-lg font-semibold hover:bg-green-700">
              Find a Tutor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
