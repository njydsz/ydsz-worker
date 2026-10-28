"""Resolve the externally visible HTTP origin for an incoming request."""

from __future__ import annotations

from starlette.requests import Request


def _first_header_value(value: str | None) -> str | None:
    if value is None:
        return None
    first = value.split(",", 1)[0].strip()
    return first or None


def _port_for_default(proto: str, port: str) -> str:
    """Return *port* only if it is non-standard for *proto* (80 for http, 443 for https)."""
    try:
        port_num = int(port)
    except (TypeError, ValueError):
        return port
    if (proto == "https" and port_num == 443) or (proto == "http" and port_num == 80):
        return ""
    return port


def resolve_public_base(request: Request) -> str:
    """Resolve the externally visible origin for an incoming request.

    Trusts ``X-Forwarded-Proto`` / ``X-Forwarded-Host`` / ``X-Forwarded-Port``
    when present (typical behind a reverse proxy). Appends ``X-Forwarded-Port``
    when the host header lacks a port (e.g. Nginx ``$host``) and the port is
    non-standard. Prefer deploying Ydsz Worker behind a trusted proxy and keeping
    the dashboard same-origin with the API for OIDC cookies.
    """
    forwarded_proto = _first_header_value(request.headers.get("x-forwarded-proto"))
    forwarded_host = _first_header_value(request.headers.get("x-forwarded-host"))
    if forwarded_proto:
        host = forwarded_host or request.headers.get("host")
        if host:
            if ":" not in host.replace("]", ""):
                forwarded_port = _first_header_value(request.headers.get("x-forwarded-port"))
                if forwarded_port:
                    non_default_port = _port_for_default(forwarded_proto, forwarded_port.strip())
                    if non_default_port:
                        host = f"{host}:{non_default_port}"
            return f"{forwarded_proto}://{host}".rstrip("/")

    return str(request.url.replace(path="", query="", fragment="")).rstrip("/")
