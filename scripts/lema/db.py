import json, sys, subprocess, re
sys.path.insert(0, sys.argv[1]); from tx import tx
S = sys.argv[1]; LARGO = 'Patatas, frutas, verduras, huevos, setas, champiñones y legumbres para '
def q(ref, sql):
    open(S+'/q.json','w').write(json.dumps({'query': sql}))
    r = subprocess.run(['curl','-sS','-X','POST',f'https://api.supabase.com/v1/projects/{ref}/database/query','-H','Authorization: Bearer proxy-injected','-H','Content-Type: application/json','--data','@'+S+'/q.json'],capture_output=True,text=True).stdout
    return json.loads(r)
lit = lambda v: "'" + v.replace("'", "''") + "'"
def walk(o):
    if isinstance(o, str): return tx(o)
    if isinstance(o, list): return [walk(x) for x in o]
    if isinstance(o, dict):
        o = {k: walk(v) for k, v in o.items()}
        if o.get('t') == 'portada' and str(o.get('titulo','')).startswith(LARGO):
            o['titulo'] = 'Patatas, frutas y verduras para ' + o['titulo'][len(LARGO):]
            if 'setas' not in str(o.get('sub','')): o['sub'] = 'También huevos, setas, champiñones y legumbres' + (' · ' + o['sub'] if o.get('sub') else '')
        return o
    return o
for ref in sys.argv[2:]:
    sql = []
    for r in q(ref, "select lema from empresa"):
        if tx(r['lema']) != r['lema']: sql.append(f"update empresa set lema = {lit(tx(r['lema']))} where lema = {lit(r['lema'])}")
    for r in q(ref, "select id, subtitulo, presentacion from listas_precios"):
        for c in ('subtitulo','presentacion'):
            if r[c] and tx(r[c]) != r[c]: sql.append(f"update listas_precios set {c} = {lit(tx(r[c]))} where id = {lit(r['id'])}")
    for r in q(ref, "select id, diapositivas from presentaciones"):
        n = walk(r['diapositivas'])
        if n != r['diapositivas']: sql.append(f"update presentaciones set diapositivas = {lit(json.dumps(n, ensure_ascii=False))}::jsonb where id = {lit(r['id'])}")
    for r in q(ref, "select clave, texto from textos_comerciales"):
        if r['texto'] and tx(r['texto']) != r['texto']: sql.append(f"update textos_comerciales set texto = {lit(tx(r['texto']))} where clave = {lit(r['clave'])}")
    print(ref, len(sql), 'cambios')
    if sql: print(q(ref, 'begin; ' + '; '.join(sql) + '; commit;'))
