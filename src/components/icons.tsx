/**
 * Home Hub icon set — hand-drawn line icons (stroke-based, 24x24 grid),
 * ported 1:1 from the approved mockup's inline SVGs. No icon library, no
 * emoji — keeps every platform (iOS / Android / Web) pixel-identical.
 */

import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const base = (strokeWidth = 1.8) => ({
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth,
});

export function HomeIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="3,11 12,4 21,11" stroke={color} {...base(strokeWidth)} />
      <Path d="M5 10v10h14V10" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function TasksIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={4} width={14} height={17} rx={2} stroke={color} {...base(strokeWidth)} />
      <Rect x={9} y={2} width={6} height={3} rx={1} stroke={color} {...base(strokeWidth)} />
      <Polyline points="9,13 11,15 15,11" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function UsersIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={8} r={3.2} stroke={color} {...base(strokeWidth)} />
      <Path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" stroke={color} {...base(strokeWidth)} />
      <Circle cx={17.2} cy={9} r={2.3} stroke={color} {...base(strokeWidth)} />
      <Path d="M15.3 14.2c2.3.2 4 2.3 4.2 5" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function WalletIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke={color}
        {...base(strokeWidth)}
      />
      <Circle cx={16.3} cy={13} r={1.3} fill={color} stroke="none" />
    </Svg>
  );
}

export function BellIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 6 2 6H4c.5 0 2-2 2-6Z" stroke={color} {...base(strokeWidth)} />
      <Path d="M10 20a2 2 0 0 0 4 0" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="15,5 8,12 15,19" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="9,5 16,12 9,19" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 20, color = '#000', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="6,9 12,15 18,9" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = '#000', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} {...base(strokeWidth)} />
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function CheckIcon({ size = 20, color = '#000', strokeWidth = 2.6 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="5,13 9,17 19,7" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={7} stroke={color} {...base(strokeWidth)} />
      <Line x1={21} y1={21} x2={16.2} y2={16.2} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function CalendarIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={5} width={18} height={16} rx={2} stroke={color} {...base(strokeWidth)} />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} {...base(strokeWidth)} />
      <Line x1={8} y1={3} x2={8} y2={7} stroke={color} {...base(strokeWidth)} />
      <Line x1={16} y1={3} x2={16} y2={7} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function ReceiptIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 3h14v18l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5V3Z"
        stroke={color}
        {...base(strokeWidth)}
      />
      <Line x1={8} y1={8} x2={16} y2={8} stroke={color} {...base(strokeWidth)} />
      <Line x1={8} y1={12} x2={16} y2={12} stroke={color} {...base(strokeWidth)} />
      <Line x1={8} y1={16} x2={13} y2={16} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function FlameIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1.4-.7-2.3-1.3-2 .9 2.6-.7 3.6-1.7 3.6a2 2 0 0 1-2-2.1c0-2.6 2.5-3.7 2-8.5Z"
        stroke={color}
        {...base(strokeWidth)}
      />
    </Svg>
  );
}

export function TrophyIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" stroke={color} {...base(strokeWidth)} />
      <Path d="M8 5H5a3 3 0 0 0 3 3" stroke={color} {...base(strokeWidth)} />
      <Path d="M16 5h3a3 3 0 0 1-3 3" stroke={color} {...base(strokeWidth)} />
      <Line x1={12} y1={12} x2={12} y2={16} stroke={color} {...base(strokeWidth)} />
      <Path d="M9 20h6" stroke={color} {...base(strokeWidth)} />
      <Line x1={12} y1={16} x2={12} y2={20} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function StarIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points="12,3 14.7,9 21,9.5 16,13.7 17.6,20 12,16.5 6.4,20 8,13.7 3,9.5 9.3,9"
        stroke={color}
        {...base(strokeWidth)}
      />
    </Svg>
  );
}

export function SlidersIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={4} y1={6} x2={20} y2={6} stroke={color} {...base(strokeWidth)} />
      <Circle cx={14} cy={6} r={2.1} stroke={color} {...base(strokeWidth)} />
      <Line x1={4} y1={12} x2={20} y2={12} stroke={color} {...base(strokeWidth)} />
      <Circle cx={8} cy={12} r={2.1} stroke={color} {...base(strokeWidth)} />
      <Line x1={4} y1={18} x2={20} y2={18} stroke={color} {...base(strokeWidth)} />
      <Circle cx={16} cy={18} r={2.1} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function TrendingUpIcon({ size = 20, color = '#000', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="3,17 9,11 13,15 21,7" stroke={color} {...base(strokeWidth)} />
      <Polyline points="15,7 21,7 21,13" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function LightbulbIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 18h6" stroke={color} {...base(strokeWidth)} />
      <Path d="M10 21h4" stroke={color} {...base(strokeWidth)} />
      <Path
        d="M12 3a6 6 0 0 0-3 11c1 .8 1 2 1 2h4s0-1.2 1-2a6 6 0 0 0-3-11Z"
        stroke={color}
        {...base(strokeWidth)}
      />
    </Svg>
  );
}

export function ClockIcon({ size = 20, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...base(strokeWidth)} />
      <Line x1={12} y1={7} x2={12} y2={12} stroke={color} {...base(strokeWidth)} />
      <Line x1={12} y1={12} x2={15.5} y2={13.5} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function RepeatIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="17,1 21,5 17,9" stroke={color} {...base(strokeWidth)} />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} {...base(strokeWidth)} />
      <Polyline points="7,23 3,19 7,15" stroke={color} {...base(strokeWidth)} />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

// Category icons

export function UtensilsIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 21V11a5 5 0 0 1 10 0v10" stroke={color} {...base(strokeWidth)} />
      <Path d="M5 21h14" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function DropletIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function BoltIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="13,2 4,14 11,14 10,22 20,10 13,10" stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function WrenchIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z"
        stroke={color}
        {...base(strokeWidth)}
      />
    </Svg>
  );
}

export function GiftIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={8} width={18} height={13} rx={1.5} stroke={color} {...base(strokeWidth)} />
      <Path d="M3 8h18v4H3z" stroke={color} {...base(strokeWidth)} />
      <Line x1={12} y1={8} x2={12} y2={21} stroke={color} {...base(strokeWidth)} />
      <Circle cx={9} cy={4} r={2} stroke={color} {...base(strokeWidth)} />
      <Circle cx={15} cy={4} r={2} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function PawIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={7} cy={8} r={1.8} stroke={color} {...base(strokeWidth)} />
      <Circle cx={11} cy={5} r={1.8} stroke={color} {...base(strokeWidth)} />
      <Circle cx={15} cy={5} r={1.8} stroke={color} {...base(strokeWidth)} />
      <Circle cx={18} cy={9} r={1.8} stroke={color} {...base(strokeWidth)} />
      <Ellipse cx={12} cy={15.5} rx={5} ry={4} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

export function HeartIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z"
        stroke={color}
        {...base(strokeWidth)}
      />
    </Svg>
  );
}

export function PinIcon({ size = 20, color = '#000', strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 22s7-4.5 7-11a7 7 0 0 0-14 0c0 6.5 7 11 7 11Z" stroke={color} {...base(strokeWidth)} />
      <Circle cx={12} cy={11} r={2.3} stroke={color} {...base(strokeWidth)} />
    </Svg>
  );
}

/** Category icon lookup, keyed by `CATEGORIES[i].icon`. */
export const CATEGORY_ICONS = {
  utensils: UtensilsIcon,
  droplet: DropletIcon,
  bolt: BoltIcon,
  wrench: WrenchIcon,
  gift: GiftIcon,
  paw: PawIcon,
  heart: HeartIcon,
  pin: PinIcon,
} as const;
