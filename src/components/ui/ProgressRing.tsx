import { Circle, Svg } from 'react-native-svg';

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  /** 0..1 */
  progress: number;
  trackColor: string;
  progressColor: string;
};

export function ProgressRing({ size = 60, strokeWidth = 6, progress, trackColor, progressColor }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashoffset}
        fill="none"
      />
    </Svg>
  );
}
