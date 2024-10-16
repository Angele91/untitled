# Eye Saver Mode Feature Plan

## Overview
The Eye Saver Mode is a new feature designed to reduce eye strain and fatigue during extended reading sessions. This mode will adjust the color scheme and contrast of the book reader interface to create a more comfortable reading experience.

## Scientific Basis

1. Blue Light Reduction:
   - Scientific evidence: Studies have shown that exposure to blue light, especially in the evening, can disrupt circadian rhythms and cause eye strain [1].
   - Implementation: Reduce the amount of blue light emitted by the screen by shifting colors towards warmer tones.

2. Contrast Adjustment:
   - Scientific evidence: High contrast between text and background can cause eye fatigue over extended periods [2].
   - Implementation: Implement a balanced contrast ratio that maintains readability while reducing eye strain.

3. Color Temperature Adjustment:
   - Scientific evidence: Warmer color temperatures have been found to be more comfortable for reading, especially in low light conditions [3].
   - Implementation: Shift the overall color temperature of the interface to a warmer tone (around 3400K-4000K).

4. Dark Mode Option:
   - Scientific evidence: Dark mode can reduce eye strain in low-light environments and may be beneficial for users with certain visual impairments [4].
   - Implementation: Provide a dark mode option within the Eye Saver Mode.

## Implementation Plan

1. Create a new component: `EyeSaverModeToggle.tsx`
   - This component will handle the UI for toggling the Eye Saver Mode on and off.

2. Update `src/state/atoms.ts`:
   - Add a new atom for storing the Eye Saver Mode state.

3. Modify `src/components/reading/settings-modal.tsx`:
   - Add the Eye Saver Mode toggle to the settings modal.

4. Create a new hook: `useEyeSaverMode.ts`
   - This hook will manage the logic for applying the Eye Saver Mode styles.

5. Update `src/App.tsx` or the main layout component:
   - Apply the Eye Saver Mode styles at the top level when enabled.

6. Modify `src/index.css` or create a new CSS file:
   - Define the color schemes and styles for the Eye Saver Mode.

7. Update `src/components/reading/memoized-markdown.tsx`:
   - Ensure that the Eye Saver Mode styles are applied to the rendered markdown content.

## Testing Plan

1. Implement unit tests for the `EyeSaverModeToggle` component and `useEyeSaverMode` hook.
2. Conduct user acceptance testing with a diverse group of users to gather feedback on the effectiveness and comfort of the Eye Saver Mode.
3. Perform cross-browser and device testing to ensure consistent functionality and appearance.

## Future Enhancements

1. Automatic mode switching based on time of day or ambient light detection.
2. Customizable color temperature and contrast settings within the Eye Saver Mode.
3. Integration with system-level dark mode settings.

## References

[1] Tosini, G., Ferguson, I., & Tsubota, K. (2016). Effects of blue light on the circadian system and eye physiology. Molecular Vision, 22, 61-72.

[2] Piepenbrock, C., Mayr, S., & Buchner, A. (2014). Smaller pupil size and better proofreading performance with positive than with negative polarity displays. Ergonomics, 57(11), 1670-1677.

[3] Bababekova, Y., Rosenfield, M., Hue, J. E., & Huang, R. R. (2011). Font size and viewing distance of handheld smart phones. Optometry and Vision Science, 88(7), 795-797.

[4] Dobres, J., Chahine, N., & Reimer, B. (2017). Effects of ambient light, text polarity, and set size on text legibility in heads-up displays. Ergonomics, 60(7), 922-929.
