import { ProductForm, SceneStyle } from '../store/appStore';

export const SCENE_PROMPTS: Record<SceneStyle, string> = {
  minimalist_studio: 'on a clean white surface in a minimalist photography studio with soft diffused lighting from above and a plain light gray background',
  scandinavian: 'on a light oak wooden table in a bright Scandinavian living room with white walls, a large window casting soft morning light from the left, and minimal decor',
  cafe: 'on a rustic dark wood cafe table next to a ceramic coffee cup, warm ambient lighting from pendant lamps overhead, blurred cafe interior in background',
  outdoor: 'laid on natural green grass in a sunlit garden, dappled sunlight filtering through tree leaves, soft bokeh nature background',
  hotel: 'draped on a crisp white hotel bed with plush pillows, soft warm bedside lamp lighting, elegant neutral-toned hotel room interior',
  loft: 'on a raw concrete surface in an industrial loft space with exposed brick walls, large steel-framed windows, warm afternoon sunlight',
  beach: 'on light sand with gentle ocean waves in the soft-focus background, golden hour warm sunlight, relaxed coastal atmosphere',
  office: 'on a clean modern desk in a bright office space with minimalist decor, natural daylight from large windows, professional corporate setting',
};

export const PRODUCT_FORM_PROMPTS: Record<ProductForm, string> = {
  folded: 'neatly folded',
  hanging: 'hanging on a wooden hanger',
  flat_lay: 'laid flat (flat lay)',
  mannequin: 'worn on an invisible mannequin (ghost mannequin style)',
  styled_flat_lay: 'styled in a flat lay arrangement with accessories',
};

export const PRESERVE_INSTRUCTION = 'Preserve exact original fabric texture, weave pattern, folds, wrinkles, and stitching details with pixel-level accuracy. Maintain exact original color values — do not shift hue, saturation or tone.';

export const buildPrompt = (
  productForm: ProductForm,
  sceneStyle: SceneStyle,
  customRequest?: string
): string => {
  const base = `Place this ${PRODUCT_FORM_PROMPTS[productForm]} textile product`;
  const scene = `${SCENE_PROMPTS[sceneStyle]}.`;
  const lighting = `Realistic soft lighting consistent with the scene. Natural contact shadow beneath the product.`;
  const style = `Professional e-commerce lifestyle photography, 50mm lens, shallow depth of field on background.`;
  const custom = customRequest ? ` ${customRequest}.` : '';
  
  return `${base} ${scene} ${PRESERVE_INSTRUCTION} ${lighting} ${style}${custom}`;
};
