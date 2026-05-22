/*
  # Seed — 10 SKUs (CLAUDE.md §8) + matching inventory rows

  - status = 'draft' (NOT visible publicly until the founder activates each in Studio).
  - prices in bani (180 RON => 18000). production_time = upper bound of stated range.
  - engraving enabled on SKU 02–09 (per CLAUDE.md), base 120 RON (12000 bani) placeholder.
  - round board uses {diameter,thickness,unit,shape}. SKU 09 stores the from-price
    (150000) with the 1.500–2.200 RON range noted in long_description.
  - inventory seeded at quantity_total = 0 (no physical stock recorded yet).

  Idempotent: ON CONFLICT (slug) DO NOTHING so re-running the seed is safe.
*/

INSERT INTO public.products
  (slug, sku, tier, name_ro, name_en, dimensions, production_time_minutes,
   price_ron, has_engraving_option, engraving_price_ron, status, sort_order,
   short_description_ro, short_description_en, long_description_ro, long_description_en)
VALUES
 ('tocator-mic','OF-01','entry','Tocător Mic','Small Cutting Board',
   '{"length":25,"width":18,"thickness":2,"unit":"cm"}',90,18000,false,NULL,'draft',1,
   'Tocător mic din stejar masiv, lucrat manual.','Small solid-oak board, handmade.',
   NULL,NULL),
 ('platou-serving','OF-02','entry','Platou Serving','Serving Platter',
   '{"length":30,"width":18,"thickness":2,"unit":"cm"}',90,24000,true,12000,'draft',2,
   'Platou de servire din stejar, finisat cu ulei alimentar.','Oak serving platter, food-safe oil finish.',
   NULL,NULL),
 ('tocator-bucatarie-mediu','OF-03','core','Tocător Bucătărie Mediu','Medium Kitchen Board',
   '{"length":35,"width":25,"thickness":3,"unit":"cm"}',120,38000,true,12000,'draft',3,
   'Tocătorul de zi cu zi, gros de 3 cm.','The everyday board, 3 cm thick.',
   NULL,NULL),
 ('tocator-bucatarie-mare','OF-04','core','Tocător Bucătărie Mare','Large Kitchen Board',
   '{"length":45,"width":30,"thickness":3,"unit":"cm"}',150,52000,true,12000,'draft',4,
   'Suprafață generoasă pentru gătit în serie.','Generous surface for batch cooking.',
   NULL,NULL),
 ('platou-lung','OF-05','core','Platou Lung','Long Platter',
   '{"length":50,"width":20,"thickness":2.5,"unit":"cm"}',120,48000,true,12000,'draft',5,
   'Platou alungit pentru aperitive și brânzeturi.','Long platter for charcuterie and cheese.',
   NULL,NULL),
 ('tocator-rotund','OF-06','core','Tocător Rotund','Round Board',
   '{"diameter":32,"thickness":2.5,"unit":"cm","shape":"round"}',150,45000,true,12000,'draft',6,
   'Tocător rotund, bun și ca platou de servire.','Round board, doubles as a serving platter.',
   NULL,NULL),
 ('bloc-end-grain-mediu','OF-07','premium','Bloc End-Grain Mediu','Medium End-Grain Block',
   '{"length":35,"width":25,"thickness":5,"unit":"cm"}',360,85000,true,12000,'draft',7,
   'Bloc end-grain care menajează lama cuțitului.','End-grain block that spares your knife edge.',
   NULL,NULL),
 ('bloc-end-grain-mare','OF-08','premium','Bloc End-Grain Mare','Large End-Grain Block',
   '{"length":45,"width":35,"thickness":6,"unit":"cm"}',480,125000,true,12000,'draft',8,
   'Bloc end-grain mare pentru bucătării serioase.','Large end-grain block for serious kitchens.',
   NULL,NULL),
 ('bloc-heirloom','OF-09','hero','Bloc Heirloom','Heirloom Block',
   '{"length":50,"width":40,"thickness":8,"unit":"cm"}',900,150000,true,12000,'draft',9,
   'Piesă de moștenire, lucrată 12–15 ore.','Heirloom piece, 12–15 hours of work.',
   'Piesă de moștenire, lucrată 12–15 ore. Preț 1.500–2.200 RON în funcție de finisaj și esență.',
   'Heirloom piece, 12–15 hours of work. 1,500–2,200 RON depending on finish and wood selection.'),
 ('platou-statement','OF-10','hero','Platou Statement','Statement Platter',
   '{"length":80,"width":25,"thickness":4,"unit":"cm"}',480,180000,false,NULL,'draft',10,
   'Platou-statement de 80 cm pentru mese mari.','An 80 cm statement platter for big tables.',
   NULL,NULL)
ON CONFLICT (slug) DO NOTHING;

-- Inventory row per product (linked by sku), starting at zero physical stock.
INSERT INTO public.inventory (product_id, quantity_total, quantity_reserved)
SELECT id, 0, 0 FROM public.products
WHERE sku IN ('OF-01','OF-02','OF-03','OF-04','OF-05','OF-06','OF-07','OF-08','OF-09','OF-10')
ON CONFLICT (product_id) DO NOTHING;
