"""Unit tests for the wizard password file lifecycle."""

from __future__ import annotations

import os
import stat
from pathlib import Path

import pytest

from ydsz.infra.setup.password_file import (
    WIZARD_FILE_NAME,
    boot_self_heal,
    ensure_password,
    read_password,
)


def _file(home: Path) -> Path:
    return home / WIZARD_FILE_NAME


def test_ensure_password_writes_file_when_missing(tmp_path: Path) -> None:
    pw = ensure_password(tmp_path)
    assert pw is not None
    assert _file(tmp_path).read_text(encoding="utf-8").strip() == pw
    assert len(pw) >= 20  # token_urlsafe(16) ≈ 22 chars


def test_ensure_password_returns_none_when_present(tmp_path: Path) -> None:
    first = ensure_password(tmp_path)
    second = ensure_password(tmp_path)
    assert first is not None
    assert second is None
    assert _file(tmp_path).read_text(encoding="utf-8").strip() == first


def test_file_mode_is_0600(tmp_path: Path) -> None:
    if os.name != "posix":
        pytest.skip("POSIX file mode bits")
    ensure_password(tmp_path)
    mode = stat.S_IMODE(os.stat(_file(tmp_path)).st_mode)
    assert mode == 0o600


def test_read_password_returns_stored_value(tmp_path: Path) -> None:
    pw = ensure_password(tmp_path)
    assert read_password(tmp_path) == pw


def test_read_password_returns_none_when_missing(tmp_path: Path) -> None:
    assert read_password(tmp_path) is None


def test_boot_self_heal_generates_when_no_users(tmp_path: Path) -> None:
    pw = boot_self_heal(tmp_path, user_count=0)
    assert pw is not None
    assert _file(tmp_path).exists()


def test_boot_self_heal_redisplays_existing_password_with_no_users(tmp_path: Path) -> None:
    first = boot_self_heal(tmp_path, user_count=0)
    second = boot_self_heal(tmp_path, user_count=0)
    assert first is not None
    assert second == first
    assert read_password(tmp_path) == first


def test_boot_self_heal_keeps_file_when_users_exist(tmp_path: Path) -> None:
    ensure_password(tmp_path)
    pw = boot_self_heal(tmp_path, user_count=1)
    assert pw is None
    assert _file(tmp_path).exists()


def test_boot_self_heal_no_op_when_users_exist_and_no_file(tmp_path: Path) -> None:
    pw = boot_self_heal(tmp_path, user_count=1)
    assert pw is None
    assert not _file(tmp_path).exists()


def test_windows_dacl_restricted_on_ensure(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """On Windows the 0o600 chmod is a no-op; icacls must set the DACL (#2370)."""
    calls: list[list[str]] = []

    def fake_run(cmd: list[str], **_kwargs: object) -> None:
        calls.append(cmd)

    monkeypatch.setattr("ydsz.infra.setup.password_file.subprocess.run", fake_run)
    monkeypatch.setattr("ydsz.infra.setup.password_file.sys.platform", "win32")
    monkeypatch.setenv("USERNAME", "alice")
    monkeypatch.setenv("USERDOMAIN", "DESKTOP-X")

    ensure_password(tmp_path)
    assert calls, "icacls must be invoked on Windows"
    cmd = calls[0]
    assert cmd[0] == "icacls"
    assert "/inheritance:r" in cmd and "/grant:r" in cmd
    assert "DESKTOP-X\\alice:F" in cmd
    assert "SYSTEM:F" in cmd


def test_windows_dacl_failure_does_not_break_ensure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def boom(*_args: object, **_kwargs: object) -> None:
        raise OSError("icacls missing")

    monkeypatch.setattr("ydsz.infra.setup.password_file.subprocess.run", boom)
    monkeypatch.setattr("ydsz.infra.setup.password_file.sys.platform", "win32")
    pw = ensure_password(tmp_path)
    assert pw is not None
    assert _file(tmp_path).read_text(encoding="utf-8").strip() == pw


def test_posix_skips_icacls(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[list[str]] = []

    def fake_run(cmd: list[str], **_kwargs: object) -> None:
        calls.append(cmd)

    monkeypatch.setattr("ydsz.infra.setup.password_file.subprocess.run", fake_run)
    monkeypatch.setattr("ydsz.infra.setup.password_file.sys.platform", "linux")
    ensure_password(tmp_path)
    assert calls == []
