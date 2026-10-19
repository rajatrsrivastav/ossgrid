"""Extract an untrusted PR preview artifact without links or escaping paths."""

import pathlib
import stat
import sys
import zipfile

archive = pathlib.Path(sys.argv[1])
destination = pathlib.Path(sys.argv[2]).resolve()

with zipfile.ZipFile(archive) as zipped:
    for member in zipped.infolist():
        path = pathlib.PurePosixPath(member.filename)
        mode = (member.external_attr >> 16) & 0xFFFF
        if (path.is_absolute() or ".." in path.parts or "\\" in member.filename):
            raise ValueError(f"unsafe artifact path: {member.filename}")
        if stat.S_ISLNK(mode):
            raise ValueError(f"symlink in artifact: {member.filename}")
        target = destination.joinpath(*path.parts)
        if member.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        with zipped.open(member) as source, target.open("wb") as output:
            while chunk := source.read(1024 * 1024):
                output.write(chunk)
