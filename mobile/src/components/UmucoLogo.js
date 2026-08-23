// Ported from web src/components/UmucoLogo.jsx. The web version injects the
// raw SVG string via dangerouslySetInnerHTML; react-native-svg's SvgXml does
// the same job in RN — same markup, same paths, nothing redrawn or simplified.
import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { umucoLogoSvg } from '../assets/umucoLogoSvg';

export default function UmucoLogo({ style = {} }) {
  const { width = 36, height = 36, ...rest } = style;
  return (
    <View style={[{ width, height, overflow: 'hidden', borderRadius: width / 2 }, rest]}>
      <SvgXml xml={umucoLogoSvg} width="100%" height="100%" />
    </View>
  );
}
