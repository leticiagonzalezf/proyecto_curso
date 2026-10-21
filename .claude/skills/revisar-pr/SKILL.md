---
name: revisar-pr
description: Revisa una pull request de leticiagonzalezf/proyecto_curso y devuelve un informe con veredicto, criterios de aceptación, hallazgos, CI y commits. Úsala cuando se pida revisar o validar una PR, por número o la de la rama actual. No la uses para explicar código, revisar cambios que no están en una PR ni resolver issues.
argument-hint: '[numero-pr]'
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(npx commitlint *)
  - mcp__github__pull_request_read
  - mcp__github__list_pull_requests
  - mcp__github__issue_read
  - mcp__github__get_commit
  - mcp__github__list_commits
  - mcp__github__get_file_contents
  - mcp__github__actions_list
  - mcp__github__actions_get
  - mcp__github__get_job_logs
---

PR: $ARGUMENTS
Rama actual: !`git log -1 --format=%D`

Revisa la PR de `leticiagonzalezf/proyecto_curso` indicada arriba; sin número, la de la rama actual. Solo lees e informas: nunca comentas en la PR, no la apruebas, no pides cambios, no la mergeas, no editas archivos ni haces push. Si algo debería publicarse en GitHub, dilo en el informe: lo decide la conversación principal.

Lee GitHub por MCP y ejecuta git y commitlint con la herramienta Bash, que es la que habilita `allowed-tools`. Read y Grep leen la copia local, que puede estar en otra rama: úsalos solo si `git log -1 --format=%H` coincide con el commit de cabeza de la PR. Si no coincide, lee los archivos con `get_file_contents` y el `sha` de ese commit. `git diff` y `git log` sirven para cualquier commit que esté en local.

1. Lee la PR. Sin número, busca con `list_pull_requests` la PR abierta cuyo `head` sea `leticiagonzalezf:<rama>`, con la rama que aparece tras `HEAD -> `; si no hay ninguna, para y dilo. Con `pull_request_read` lee la PR (`get`: título, descripción, rama base y rama de origen), sus commits (`get_commits`), sus archivos (`get_files`) y el diff (`get_diff`). Con `issue_read` lee la issue que cierra con «Closes #n». Lee la CI del último commit con `get_check_runs` y `get_status`; si un check falla, lee solo el final de su log con `get_job_logs`.
2. Lee el CLAUDE.md de la rama base con `get_file_contents` y aplica las reglas que afecten a los archivos cambiados. Si la PR cambia CLAUDE.md, revisa con el de la base y señala el cambio.
3. Para cada criterio de «Criterios de aceptación» de la issue, indica si se cumple, no se cumple o no se puede verificar, con evidencia: `archivo:línea` del commit de cabeza, salida de la CI o commit. Si un criterio pide ejecutar algo (como `npm run check`), se cumple solo si un check de la CI lo ejecuta y está en verde; si no, no se puede verificar. Un criterio condicional cuya condición no se da se cumple: explícalo en la evidencia.
4. Comprueba el proceso según «Flujo de git» de CLAUDE.md:
   - La PR va contra `dev`.
   - La rama sigue el formato de ramas de «Flujo de git», con el número de la issue que cierra.
   - La descripción incluye «Closes #n».
   - Cada mensaje de commit pasa commitlint: `git log -1 --format=%B <sha> | npx commitlint --extends @commitlint/config-conventional`. Si el commit no está en local, márcalo como no verificado y sugiere `git fetch`.
   - La CI está en verde. Di qué valida cada check: uno en verde que no ejecuta `npm run check` no demuestra que el código pase. Sin checks, la CI no está en verde.
5. Señala los cambios que quedan fuera del alcance de la issue: archivos o cambios que no piden ni sus criterios ni su propuesta.
6. Distingue los errores demostrados (una línea que incumple una regla o un criterio, un check que falla, un commit que no pasa commitlint) de los riesgos sin demostrar. No inventes hallazgos: si no hay defectos, dilo.
7. Devuelve el informe con la plantilla de [formato-informe.md](formato-informe.md). Es tu último mensaje: no añadas nada fuera de la plantilla.
