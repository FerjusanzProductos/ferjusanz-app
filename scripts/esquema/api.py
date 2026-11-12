import json, subprocess, sys
def q(sql, ref="hvydnjaswdexttogsyen"):
    body = json.dumps({"query": sql})
    r = subprocess.run(["curl","-sS","-X","POST",f"https://api.supabase.com/v1/projects/{ref}/database/query",
        "-H","Authorization: Bearer proxy-injected","-H","Content-Type: application/json","--data-binary","@-"],
        input=body.encode(), capture_output=True)
    d = json.loads(r.stdout)
    if isinstance(d, dict): raise RuntimeError(d)
    return d
