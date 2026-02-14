export default function MatchScoreBar({ score }) {
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-700">Match Score</span>
        <span className="text-sm font-bold text-gmu-green">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
