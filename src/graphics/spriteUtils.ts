import { SPRITE_SCALE } from '../constants';

/** Scale a pixel dimension by SPRITE_SCALE (for sprite drawing coordinates) */
export const S = (px: number) => px * SPRITE_SCALE;

/** Scale for physics/gameplay values that depend on sprite size (radii, ranges, speeds) */
export const R = (radius: number) => radius * SPRITE_SCALE;
