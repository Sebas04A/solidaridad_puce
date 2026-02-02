# Guía de Despliegue - Supabase

## 1. Prerequisitos

Necesitas tener la CLI de Supabase instalada o usar `npx`.
También necesitas el **Service Role Key** de tu proyecto Supabase (Dashboard -> Project Settings -> API).

## 2. Login

Si es la primera vez:
```bash
npx supabase login
```

## 3. Desplegar Edge Function

Para desplegar la función que permite crear usuarios (Administradores/Voluntarios):

```bash
npx supabase functions deploy admin-create-user --no-verify-jwt
```
*Nota: `--no-verify-jwt` es importante porque validamos el JWT manualmente dentro de la función o si la llamamos desde el cliente con nuestra propia lógica (aunque `supabase.functions.invoke` envía el JWT por defecto, esta flag a veces facilita el desarrollo si hay problemas de CORS/Auth).*

## 4. Configurar Secretos

La función necesita permisos de administrador para crear usuarios. Debes configurar la variable de entorno:

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_roll_key_aqui
```
*(No es necesario establecer `SUPABASE_URL` o `SUPABASE_ANON_KEY`, se inyectan automáticamente).*

## 5. Verificar

Ve a tu Dashboard en Supabase -> Edge Functions. Deberías ver `admin-create-user` con estado "Active".
