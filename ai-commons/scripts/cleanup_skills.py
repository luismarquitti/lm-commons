import os
from pathlib import Path

SOURCE_PATHS = [
    r"C:\devWorkspace\personal-agent\.agents\skills",
    r"C:\devWorkspace\ClinicCare\.agents\skills",
    r"C:\devWorkspace\LuisGitAgent\.agents\skills",
]

# Add agents-squad paths
agents_squad_root = Path(r"C:\devWorkspace\agents-squad")
for agent_dir in agents_squad_root.iterdir():
    if agent_dir.is_dir():
        skills_dir = agent_dir / "skills"
        if skills_dir.exists():
            SOURCE_PATHS.append(str(skills_dir))

def cleanup():
    for source_dir in SOURCE_PATHS:
        source_dir = Path(source_dir)
        if not source_dir.exists():
            continue
        
        print(f"Cleaning {source_dir}...")
        for item in source_dir.iterdir():
            try:
                if item.is_symlink() or item.is_file():
                    item.unlink()
                    print(f"  Removed link/file: {item.name}")
                elif item.is_dir():
                    import shutil
                    shutil.rmtree(item)
                    print(f"  Removed dir: {item.name}")
            except Exception as e:
                print(f"  Error removing {item}: {e}")

if __name__ == "__main__":
    cleanup()
