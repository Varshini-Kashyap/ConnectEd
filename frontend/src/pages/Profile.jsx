import { useAuthStore } from '../stores/authStore';
import NavBar from '../components/NavBar';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-24 h-24 rounded-full mr-6"
            />
            <div>
              <h1 className="text-3xl font-bold text-gmu-green">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block bg-gmu-gold text-gmu-green px-3 py-1 rounded-full text-sm font-semibold mt-2">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {user.major && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Major</h3>
                <p className="text-lg">{user.major}</p>
              </div>
            )}

            {user.year && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Year</h3>
                <p className="text-lg">{user.year}</p>
              </div>
            )}

            {user.gpa && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">GPA</h3>
                <p className="text-lg">{parseFloat(user.gpa).toFixed(2)}</p>
              </div>
            )}

            {user.company && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Company</h3>
                <p className="text-lg">{user.company}</p>
              </div>
            )}

            {user.job_title && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Job Title</h3>
                <p className="text-lg">{user.job_title}</p>
              </div>
            )}

            {user.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Bio</h3>
                <p className="text-lg">{user.bio}</p>
              </div>
            )}

            {user.is_tutor && (
              <div className="bg-gmu-green text-white p-4 rounded-lg">
                <p className="font-semibold">✓ Available as a Tutor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
