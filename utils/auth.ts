// 解析 USERS 环境变量：格式 `账号:密码=允许目录,目录;账号2:密码2=*`
// 条目用 ; 分隔，每条为 `user:pass=dirs`，dirs 用 , 分隔或为 *
function lookup_account(context, account: string): string | null {
  // 1) 优先从聚合变量 USERS 中查找（推荐，Pages 变量名不允许冒号）
  const users = context.env["USERS"];
  if (users) {
    for (const entry of users.split(";")) {
      const idx = entry.lastIndexOf("=");
      if (idx < 0) continue;
      if (entry.slice(0, idx) === account) return entry.slice(idx + 1);
    }
  }
  // 2) 兼容旧写法：直接把 `账号:密码` 作为变量名的环境变量（本地 dev 可用）
  const legacy = context.env[account];
  if (legacy !== undefined) return legacy;
  return null;
}

export function get_auth_status(context) {
    var dopath = context.request.url.split("/api/write/items/")[1]
    if(context.env["GUEST"]){
        if(dopath.startsWith("_$flaredrive$/thumbnails/"))return true;
        const allow_guest = context.env["GUEST"].split(",")
        for (var aa of allow_guest){
            if(aa == "*"){
                return true
            }else if(dopath.startsWith(aa)){
                return true
            }
        }
    }
    var headers = new Headers(context.request.headers);
    if(!headers.get('Authorization'))return false
    const Authorization=headers.get('Authorization').split("Basic ")[1]
    const account = atob(Authorization);
    if(!account)return false
    const allow_dirs = lookup_account(context, account);
    if(allow_dirs === null)return false
    if(dopath.startsWith("_$flaredrive$/thumbnails/"))return true;
    const allow = allow_dirs.split(",")
    for (var a of allow){
        if(a == "*"){
            return true
        }else if(dopath.startsWith(a)){
            return true
        }
    }
    return false;
  }
