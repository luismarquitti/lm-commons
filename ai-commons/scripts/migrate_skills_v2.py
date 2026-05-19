import os
import shutil
import hashlib
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

TARGET_ROOT = Path(r"C:\devWorkspace\.ai-commons\skills")

def get_skill_stats(skill_path):
    skill_path = Path(skill_path)
    if not skill_path.is_dir():
        return None
    
    files = list(skill_path.glob("**/*"))
    num_files = len([f for f in files if f.is_file()])
    total_size = sum(f.stat().st_size for f in files if f.is_file())
    has_skill_md = (skill_path / "SKILL.md").exists()
    
    return {
        "num_files": num_files,
        "total_size": total_size,
        "has_skill_md": has_skill_md,
        "path": str(skill_path)
    }

def main():
    skill_map = {} # skill_name -> best_stats
    
    # Check existing skills in target
    if TARGET_ROOT.exists():
        for skill_dir in TARGET_ROOT.iterdir():
            if skill_dir.is_dir():
                stats = get_skill_stats(skill_dir)
                if stats:
                    skill_map[skill_dir.name] = stats

    all_found_skills = []

    # Map all skills from sources
    for source_dir in SOURCE_PATHS:
        source_dir = Path(source_dir)
        if not source_dir.exists():
            continue
        
        for skill_dir in source_dir.iterdir():
            if skill_dir.is_dir():
                stats = get_skill_stats(skill_dir)
                if not stats:
                    continue
                
                skill_name = skill_dir.name
                all_found_skills.append((skill_name, stats))
                
                if skill_name not in skill_map:
                    skill_map[skill_name] = stats
                else:
                    # Comparison logic: 
                    # 1. Presence of SKILL.md
                    # 2. Number of files
                    # 3. Total size
                    current_best = skill_map[skill_name]
                    
                    is_better = False
                    if stats["has_skill_md"] and not current_best["has_skill_md"]:
                        is_better = True
                    elif stats["has_skill_md"] == current_best["has_skill_md"]:
                        if stats["num_files"] > current_best["num_files"]:
                            is_better = True
                        elif stats["num_files"] == current_best["num_files"]:
                            if stats["total_size"] > current_best["total_size"]:
                                is_better = True
                    
                    if is_better:
                        skill_map[skill_name] = stats

    # Migration
    if not TARGET_ROOT.exists():
        TARGET_ROOT.mkdir(parents=True)

    migrated_count = 0
    consolidated = []
    errors = []

    # Step 1: Copy best versions to target
    for skill_name, best_stats in skill_map.items():
        target_path = TARGET_ROOT / skill_name
        source_path = Path(best_stats["path"])
        
        # If the best version is already in target, skip copy but log for report if it came from source
        if target_path.exists() and source_path.resolve() == target_path.resolve():
            continue
        
        try:
            if target_path.exists():
                # We are replacing with a better version from source
                shutil.rmtree(target_path)
            
            shutil.copytree(source_path, target_path)
            migrated_count += 1
        except Exception as e:
            errors.append(f"Error migrating {skill_name}: {e}")

    # Step 2: Identify duplicates and consolidated
    skill_names_found = [s[0] for s in all_found_skills]
    unique_names = set(skill_names_found)
    for name in unique_names:
        occurrences = [s for s in all_found_skills if s[0] == name]
        if len(occurrences) > 1:
            consolidated.append({
                "name": name,
                "count": len(occurrences),
                "paths": [s[1]["path"] for s in occurrences]
            })

    # Step 3: Remove original folders (DANGEROUS - do it carefully)
    # The prompt says: "Remova as pastas físicas originais nos projetos"
    for source_dir in SOURCE_PATHS:
        source_dir = Path(source_dir)
        if not source_dir.exists():
            continue
        for skill_dir in source_dir.iterdir():
            if skill_dir.is_dir():
                # Safety check: ensure it was migrated or already exists in target
                target_path = TARGET_ROOT / skill_dir.name
                if target_path.exists():
                    try:
                        shutil.rmtree(skill_dir)
                    except Exception as e:
                        errors.append(f"Error removing original {skill_dir}: {e}")

    # Final Report
    print(f"Total skills unique: {len(skill_map)}")
    print(f"Total skills migrated/updated: {migrated_count}")
    print(f"Total consolidated: {len(consolidated)}")
    
    print("\nConsolidated Skills Detail:")
    for c in consolidated:
        print(f"- {c['name']} ({c['count']} versions consolidated)")

    if errors:
        print("\nErrors:")
        for err in errors:
            print(f"- {err}")

    # Patterns check
    non_standard = [name for name, stats in skill_map.items() if not stats["has_skill_md"]]
    if non_standard:
        print("\nSkills not following AgentSkills standard (missing SKILL.md):")
        for name in non_standard:
            print(f"- {name}")

if __name__ == "__main__":
    main()
