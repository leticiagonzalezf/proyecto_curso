# Formato del informe de revisar-pr

Copia la plantilla y rellena todas las secciones. Si una sección no tiene contenido, escribe «Ninguno».

```markdown
# Revisión de la PR #<número>: <título>

**Veredicto:** <Aprobable / Aprobable con cambios / No aprobable>

<Una o dos frases que justifican el veredicto.>

## Criterios de aceptación de #<issue>

| Criterio             | Estado                                             | Evidencia                                |
| -------------------- | -------------------------------------------------- | ---------------------------------------- |
| <texto del criterio> | <Se cumple / No se cumple / No se puede verificar> | <archivo:línea, check de la CI o commit> |

## Hallazgos

### 1. <Título breve> (<Error demostrado / Riesgo>, gravedad <alta / media / baja>)

- **Evidencia:** <archivo:línea, salida de la CI o commit>
- **Impacto:** <qué falla o puede fallar, y en qué caso>
- **Comprobación sugerida:** <cómo confirmarlo o descartarlo>

## Proceso, CI y commits

| Comprobación                  | Resultado                                                                   |
| ----------------------------- | --------------------------------------------------------------------------- |
| PR contra `dev`               | <Sí / No>: `<rama base>`                                                    |
| Formato de la rama            | <Sí / No>: `<rama>`                                                         |
| «Closes #n» en la descripción | <Sí / No>: <#n>                                                             |
| CI del commit `<sha corto>`   | <En verde / Falla / Sin checks>: <cada check con su resultado y qué valida> |

| Commit        | Mensaje         | commitlint                                        |
| ------------- | --------------- | ------------------------------------------------- |
| `<sha corto>` | <primera línea> | <Pasa / Falla / No verificado>: <regla que falla> |

## Pendientes de verificar

- <Qué no se ha podido comprobar, por qué y cómo comprobarlo.>
```

## Reglas

- Veredicto:
  - **Aprobable:** ningún criterio sin cumplir, ningún error demostrado y el proceso correcto.
  - **Aprobable con cambios:** errores que se corrigen sin rehacer el trabajo, como un mensaje de commit, la descripción de la PR o una convención de CLAUDE.md.
  - **No aprobable:** algún criterio sin cumplir, un error demostrado de gravedad alta o una PR que no va contra `dev`.
- Un riesgo sin demostrar no basta para «No aprobable».
- Los criterios que no se pueden verificar no impiden «Aprobable», pero se citan en la justificación del veredicto y se repiten en «Pendientes de verificar».
- Ordena los hallazgos de mayor a menor gravedad; con la misma gravedad, primero los errores demostrados. Los cambios fuera del alcance de la issue son hallazgos.
- Si no hay hallazgos, escribe: «Sin hallazgos: no se han encontrado defectos».
