import { useAuthStore } from '../stores/authStore';
import StudentQuestionnaire from './StudentQuestionnaire';
import AlumniQuestionnaire from './AlumniQuestionnaire';
import { Navigate } from 'react-router-dom';

export default function Questionnaire() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.profile_completed) {
    return <Navigate to="/stream-selector" />;
  }

  return user.role === 'student' ? <StudentQuestionnaire /> : <AlumniQuestionnaire />;
}
