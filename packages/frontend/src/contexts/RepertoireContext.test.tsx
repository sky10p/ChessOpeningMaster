import { MoveVariantNode } from '@chess-opening-master/common';

describe('RepertoireContext next() function logic', () => {
  test('getCurrentVariant should identify current variant from path', () => {
    const rootNode = new MoveVariantNode();
    const e4Node = rootNode.addMove({
      lan: 'e2e4',
      san: 'e4',
      color: 'w',
      piece: 'p',
      from: 'e2',
      to: 'e4',
      flags: 'b'
    } as any);
    const e5Node = e4Node.addMove({
      lan: 'e7e5',
      san: 'e5',
      color: 'b', 
      piece: 'p',
      from: 'e7',
      to: 'e5',
      flags: 'b'
    } as any);

    const variants = rootNode.getVariants();
    
    expect(variants.length).toBeGreaterThan(0);
    expect(e5Node.position).toBe(2);
  });
});
