#!/usr/bin/env python3
"""Gera web/data/taco.json (com micronutrientes) e web/data/usda.json a partir das tabelas oficiais.

Fontes (baixe e descompacte antes de rodar):
  TACO 4ª ed. (NEPA/Unicamp)   github.com/raulfdm/taco-api  references/csv/{food,nutrients,fatty-acids,categories}.csv
  USDA FoodData Central         fdc.nal.usda.gov/download-datasets  SR Legacy (CSV, 2018-04), domínio público

Uso: python3 scripts/build-dados.py <pasta_taco_csv> <pasta_usda_sr_csv>
Os nomes em português da USDA vêm de scripts/dados/usda-pt.json (gerado por scripts/traduzir-usda.mjs).
"""
import csv, json, sys, os

TACO_DIR, USDA_DIR = sys.argv[1], sys.argv[2]
RAIZ = os.path.join(os.path.dirname(__file__), '..', 'web', 'data')

# Chave curta -> (coluna TACO, id do nutriente USDA). Tudo por 100 g.
CAMPOS = {
    'kcal': ('kcal', 1008), 'ptn': ('protein', 1003), 'cho': ('carbohydrates', 1005), 'lip': ('lipids', 1004),
    'fib': ('dietaryFiber', 1079), 'na': ('sodium', 1093), 'sat': (None, 1258), 'acu': (None, 2000), 'col': ('cholesterol', 1253),
    'ca': ('calcium', 1087), 'fe': ('iron', 1089), 'mg': ('magnesium', 1090), 'p': ('phosphorus', 1091), 'k': ('potassium', 1092),
    'zn': ('zinc', 1095), 'cu': ('copper', 1098), 'mn': ('manganese', 1101), 'se': (None, 1103),
    'vita': ('rae', 1106), 'vitd': (None, 1114), 'vite': (None, 1109), 'vitk': (None, 1185), 'vitc': ('vitaminC', 1162),
    'b1': ('thiamin', 1165), 'b2': ('riboflavin', 1166), 'b3': ('niacin', 1167), 'b6': ('pyridoxine', 1175), 'b9': (None, 1190), 'b12': (None, 1178),
}
UNIDADES = {'kcal': 'kcal', 'ptn': 'g', 'cho': 'g', 'lip': 'g', 'fib': 'g', 'na': 'mg', 'sat': 'g', 'acu': 'g', 'col': 'mg', 'ca': 'mg', 'fe': 'mg',
            'mg': 'mg', 'p': 'mg', 'k': 'mg', 'zn': 'mg', 'cu': 'mg', 'mn': 'mg', 'se': 'µg', 'vita': 'µg RAE', 'vitd': 'µg', 'vite': 'mg',
            'vitk': 'µg', 'vitc': 'mg', 'b1': 'mg', 'b2': 'mg', 'b3': 'mg', 'b6': 'mg', 'b9': 'µg DFE', 'b12': 'µg'}


def num(v):
    try:
        return round(float(v), 3)
    except (TypeError, ValueError):
        return None  # vazio, "NA" ou "Tr": sem dado


def ler(caminho):
    with open(caminho, encoding='utf-8') as f:
        return list(csv.DictReader(f))


# ---------- USDA SR Legacy ----------
FORA = {'21', '24', '25', '26', '27'}  # fast food, alimentos indígenas dos EUA, restaurantes, marcas, controle de qualidade
cats_usda = {r['id']: r['description'] for r in ler(os.path.join(USDA_DIR, 'food_category.csv'))}
foods = {r['fdc_id']: r for r in ler(os.path.join(USDA_DIR, 'food.csv')) if r['food_category_id'] not in FORA}
por_id = {v[1]: k for k, v in CAMPOS.items()}
nutr = {}
with open(os.path.join(USDA_DIR, 'food_nutrient.csv'), encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['fdc_id'] in foods and int(r['nutrient_id']) in por_id:
            nutr.setdefault(r['fdc_id'], {})[por_id[int(r['nutrient_id'])]] = num(r['amount'])
pt = {}
try:
    pt = json.load(open(os.path.join(os.path.dirname(__file__), 'dados', 'usda-pt.json'), encoding='utf-8'))
except FileNotFoundError:
    print('aviso: sem usda-pt.json, nomes ficam em inglês')
usda = []
for fid, fo in foods.items():
    n = nutr.get(fid, {})
    if not n.get('kcal'):
        continue
    usda.append({'id': 'u' + fid, 'nome': pt.get(fid) or fo['description'], 'en': fo['description'], 'cat': cats_usda[fo['food_category_id']],
                 **{k: v for k, v in n.items() if v is not None}})
usda.sort(key=lambda x: x['nome'])

# ---------- TACO ----------
cats = {r['id']: r['name'] for r in ler(os.path.join(TACO_DIR, 'categories.csv'))}
tn = {r['foodId']: r for r in ler(os.path.join(TACO_DIR, 'nutrients.csv'))}
ta = {r['foodId']: r for r in ler(os.path.join(TACO_DIR, 'fatty-acids.csv'))}
# A TACO 4ª ed. não traz energia e macronutrientes destes itens; completamos com o equivalente USDA (marcado em "complemento").
COMPLETA_COM_USDA = {'457': '171269', '458': '171265'}  # leite desnatado UHT -> nonfat; leite integral -> whole 3.25%
usda_por_fdc = {u['id'][1:]: u for u in usda}
taco = []
for r in ler(os.path.join(TACO_DIR, 'food.csv')):
    n, a = tn.get(r['id'], {}), ta.get(r['id'], {})
    item = {'id': int(r['id']), 'nome': r['name'].replace('  ', ' '), 'cat': cats[r['categoryId']]}
    for k, (col, _) in CAMPOS.items():
        v = num(n.get(col)) if col else None
        if k == 'sat':
            v = num(a.get('saturated'))
        if v is not None:
            item[k] = v
    if r['id'] in COMPLETA_COM_USDA and r['id'] in tn:
        u = usda_por_fdc.get(COMPLETA_COM_USDA[r['id']])
        if u:
            for k in ('kcal', 'ptn', 'cho', 'lip', 'fib', 'sat', 'acu', 'b12', 'b9'):  # sem vitamina D: o leite dos EUA é fortificado, o brasileiro não
                if k not in item and k in u:
                    item[k] = u[k]
            item['complemento'] = 'Energia e macronutrientes da USDA (' + u['en'] + '), ausentes na TACO 4ª ed.'
    taco.append(item)

json.dump({'fonte': 'TACO 4ª edição (NEPA/Unicamp, 2011), via github.com/raulfdm/taco-api (MIT). Valores por 100 g.', 'unidades': UNIDADES, 'alimentos': taco},
          open(os.path.join(RAIZ, 'taco.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'fonte': 'USDA FoodData Central, SR Legacy (abril de 2018), domínio público. Valores por 100 g.', 'unidades': UNIDADES, 'alimentos': usda},
          open(os.path.join(RAIZ, 'usda.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'TACO: {len(taco)} alimentos | USDA: {len(usda)} alimentos ({sum(1 for u in usda if u["nome"] != u["en"])} com nome em português)')
