import { fixedSize } from '@expo/ui/swift-ui/modifiers';

// Let SwiftUI measure wrapped text at its full height inside the RN scroll view.
export const offsiteScreenModifiers = [fixedSize({ horizontal: false, vertical: true })];
