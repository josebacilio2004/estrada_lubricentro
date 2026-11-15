# 🧭 Guía de Contribución y Control de Versiones

## Ecosistema Digital Lubricentros Estrada S.A.C.

Este documento establece las políticas obligatorias de **control de versiones**, flujo de trabajo en Git (**Git Flow**), estándares de codificación y convenciones de commits para todo el equipo de desarrollo que colabora en el repositorio.

---

## 🌳 1. Estrategia de Ramas (Git Flow)

El proyecto utiliza una variante moderna de Git Flow orientada a integración y entrega continuas.

```text
  main (Producción)
    ▲
    │ Merge de Release / Hotfix
    │
  develop (Integración y Staging)
    ▲                   ▲
    │                   │
  feature/pos-cart    feature/portal-auth
```

### 1.1. Ramas Principales (Permanentes)

* **`main`**:
  * Representa el estado de **producción**.
  * Cada commit en `main` debe corresponder a una versión etiquetada (`git tag vX.Y.Z`).
  * No se realizan commits directos en `main`.
* **`develop`**:
  * Rama principal de desarrollo donde se integran todas las nuevas características probadas.
  * Punto de partida para crear nuevas ramas `feature/*` y destino de los Pull Requests.

### 1.2. Ramas de Apoyo (Temporales)

| Tipo de Rama | Prefijo | Origen | Destino | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Feature** | `feature/<modulo-descripcion>` | `develop` | `develop` | Nuevas funcionalidades (ej. `feature/portal-citas`) |
| **Bugfix** | `bugfix/<modulo-descripcion>` | `develop` | `develop` | Corrección de errores no críticos en desarrollo |
| **Hotfix** | `hotfix/<descripcion-urgente>` | `main` | `main` y `develop` | Parches urgentes en producción |
| **Release** | `release/vX.Y.Z` | `develop` | `main` y `develop` | Preparación de versión y control de calidad |

---

## 📝 2. Convención de Mensajes de Commit (Conventional Commits)

Seguimos la especificación de **Conventional Commits v1.0.0**. La estructura de cada commit debe ser:

```text
<tipo>(<alcance opcional>): <descripción imperativa en minúsculas>

[cuerpo explicativo opcional]

[referencias a issues o tickets opcional]
```

### 2.1. Tipos de Commit Permitidos

* **`feat`**: Una nueva funcionalidad para el usuario final o módulo del sistema.
  * *Ejemplo:* `feat(pos): agregar selector de clientes frecuentes desde crm`
* **`fix`**: Corrección de un fallo o bug en backend o frontend.
  * *Ejemplo:* `fix(api): corregir cálculo de redondeo igv en ventas no gravadas`
* **`security`**: Mejoras específicas de seguridad, parches o hardening.
  * *Ejemplo:* `security(auth): migrar hashing de contraseñas a bcrypt con pgcrypto`
* **`perf`**: Cambio que mejora el rendimiento de ejecución o consumo de memoria.
  * *Ejemplo:* `perf(db): agregar indice gin_trgm en nombres de clientes para busqueda rapida`
* **`docs`**: Cambios exclusivos en archivos de documentación o comentarios.
  * *Ejemplo:* `docs: actualizar readme con guia de instalacion y endpoints api`
* **`refactor`**: Modificación de código que no corrige un bug ni añade una funcionalidad.
  * *Ejemplo:* `refactor(worker): desacoplar envio de notificaciones a interfaz independiente`
* **`test`**: Creación o actualización de pruebas unitarias o de integración.
  * *Ejemplo:* `test(calc): añadir casos de prueba para cálculo de vida util del aceite`
* **`style`**: Ajustes de formato, espaciado, comas o linting sin impacto en la lógica.
  * *Ejemplo:* `style(frontend): formatear componentes con prettier y tailwind`
* **`chore`**: Tareas de mantenimiento, dependencias o configuración de compiladores.
  * *Ejemplo:* `chore(deps): actualizar dependencias de next.js y lucide-react`
* **`ci`**: Cambios en flujos de trabajo de GitHub Actions o scripts de despliegue.
  * *Ejemplo:* `ci: configurar validacion automatica de docker-compose en pipeline`

---

## 🔐 3. Políticas de Seguridad y Manejo de Secretos

1. **Nunca realizar commits con secretos reales:**
   * Las credenciales de base de datos, llaves API, tokens JWT y contraseñas jamás deben guardarse en el historial de Git.
   * Utilizar siempre `.env.example` para documentar las variables requeridas sin valores reales.
2. **Archivos Binarios y Pesados:**
   * No subir binarios compilados (`.exe`, binarios de Go), instaladores ni ejecutables pesados (como `cloudflared.exe`).
   * Los artefactos de build (`.next/`, `node_modules/`, `coverage/`) deben permanecer estrictamente ignorados en `.gitignore`.
3. **Revisión de `git status` antes de confirmar:**
   * Siempre ejecutar `git status` antes de un commit para comprobar que no se incluyan archivos temporales o accidentales.

---

## 🔄 4. Ciclo de Trabajo Paso a Paso

### 4.1. Iniciar una nueva tarea
```bash
# 1. Asegurarse de tener la última versión de develop
git checkout develop
git pull origin develop

# 2. Crear una rama de característica
git checkout -b feature/nueva-funcionalidad
```

### 4.2. Desarrollar y verificar localmente
Antes de hacer commit, verificar que el proyecto compila y pasa las validaciones:
```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd ../backend
go test ./...
```

### 4.3. Realizar commits atómicos
Hacer commits pequeños y enfocados:
```bash
git add .
git commit -m "feat(crm): implementar filtro por estado de mantenimiento vehicular"
```

### 4.4. Enviar cambios y solicitar Pull Request
```bash
git push -u origin feature/nueva-funcionalidad
```
* Abrir el Pull Request en GitHub apuntando hacia la rama **`develop`**.
* Al menos una revisión técnica aprobada es requerida antes de integrar.

---

## 🏷 5. Política de Versionamiento Semántico (SemVer)

Las versiones se etiquetan en la rama `main` siguiendo la nomenclatura `vMAJOR.MINOR.PATCH`:
* **MAJOR (X.0.0):** Cambios incompatibles con versiones previas o reestructuración mayor de la arquitectura.
* **MINOR (0.X.0):** Nuevas funcionalidades compatibles con la versión actual (ej. incorporación de un nuevo módulo al ERP).
* **PATCH (0.0.X):** Correcciones de errores y parches de seguridad retrocompatibles.

Para generar una etiqueta de versión:
```bash
git checkout main
git tag -a v2.0.0 -m "Release v2.0.0: Ecosistema Digital Lubricentros Estrada con Portal y ERP POS"
git push origin v2.0.0
```
