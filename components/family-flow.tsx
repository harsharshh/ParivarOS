import { useMemo } from 'react';
import { useThemeName } from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Text as SvgText, Rect, G } from 'react-native-svg';

import { ThemeColors, accentPalette } from '@/constants/tamagui-theme';

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  fill?: string;
};

type Edge = {
  from: string;
  to: string;
};

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 240;

const AnimatedView = Animated.View;

export function FamilyFlow() {
  const themeName = useThemeName();
  const palette = ThemeColors[themeName] ?? ThemeColors.light;
  const themeKey = themeName === 'dark' ? 'dark' : 'light';
  const accent = accentPalette[themeKey] ?? accentPalette.light;
  const backgroundAccent = accent[2] ?? accent[0] ?? palette.background;

  const nodes = useMemo<Node[]>(
    () => {
      return [
        { id: 'parents', label: 'Parents', x: CANVAS_WIDTH / 2, y: 40, fill: accent[6] ?? palette.tint },
        { id: 'self', label: 'You', x: CANVAS_WIDTH / 2 - 70, y: 120, fill: accent[8] ?? palette.tint },
        { id: 'spouse', label: 'Partner', x: CANVAS_WIDTH / 2 + 70, y: 120, fill: accent[8] ?? palette.tint },
        { id: 'kid1', label: 'Child A', x: CANVAS_WIDTH / 2 - 110, y: 200, fill: accent[9] ?? palette.tint },
        { id: 'kid2', label: 'Child B', x: CANVAS_WIDTH / 2 - 30, y: 200, fill: accent[9] ?? palette.tint },
        { id: 'sibling', label: 'Sibling', x: CANVAS_WIDTH / 2 + 110, y: 200, fill: accent[7] ?? palette.tint },
      ];
    },
    [accent, palette.tint]
  );

  const edges = useMemo<Edge[]>(
    () => [
      { from: 'parents', to: 'self' },
      { from: 'parents', to: 'spouse' },
      { from: 'self', to: 'kid1' },
      { from: 'self', to: 'kid2' },
      { from: 'spouse', to: 'kid1' },
      { from: 'spouse', to: 'kid2' },
      { from: 'parents', to: 'sibling' },
    ],
    []
  );

  const panContextX = useSharedValue(0);
  const panContextY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panContextX.value = translateX.value;
      panContextY.value = translateY.value;
    })
    .onChange((event) => {
      translateX.value = panContextX.value + event.translationX;
      translateY.value = panContextY.value + event.translationY;
    });

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView style={[{ width: '100%', height: 260, overflow: 'hidden' }, canvasStyle]}>
        <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
          <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} rx={24} fill={backgroundAccent} opacity={themeName === 'dark' ? 0.22 : 0.12} />

          {edges.map((edge) => {
            const fromNode = nodes.find((node) => node.id === edge.from);
            const toNode = nodes.find((node) => node.id === edge.to);
            if (!fromNode || !toNode) {
              return null;
            }
            return (
              <Line
                key={`${edge.from}-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y + 20}
                x2={toNode.x}
                y2={toNode.y - 20}
                stroke={accent[6] ?? palette.tint}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {nodes.map((node) => (
            <G key={node.id}>
              <Circle cx={node.x} cy={node.y} r={22} fill={node.fill ?? palette.accent} />
              <SvgText
                x={node.x}
                y={node.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={themeName === 'dark' ? palette.accentForeground : ThemeColors.light.background}
                fontSize={11}
                fontWeight="600"
              >
                {node.label}
              </SvgText>
            </G>
          ))}
        </Svg>
      </AnimatedView>
    </GestureDetector>
  );
}
