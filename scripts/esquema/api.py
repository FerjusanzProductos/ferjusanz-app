import json, os, subprocess, sys, time
def q(sql, ref=os.environ.get("REF", "hvydnjaswdexttogsyen")):   # REF=pbeuxbwbpmlanbhhnpgy para la base de pruebas
    body = json.dumps({"query": sql})
    for intento in range(6):   # la API frena si hay muchas consultas seguidas: esperar y reintentar
        r = subprocess.run(["curl","-sS","-X","POST",f"https://api.supabase.com/v1/projects/{ref}/database/query",
            "-H","Authorization: Bearer proxy-injected","-H","Content-Type: application/json","--data-binary","@-"],
            input=body.encode(), capture_output=True)
        d = json.loads(r.stdout)
        if not (isinstance(d, dict) and 'Too Many Requests' in str(d.get('message'))): break
        time.sleep(10 * (intento + 1))
    if isinstance(d, dict): raise RuntimeError(d)
    return d
