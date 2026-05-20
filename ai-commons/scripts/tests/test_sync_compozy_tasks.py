#!/usr/bin/env python3
import os
import sys
import json
import unittest
import tempfile
from unittest.mock import patch, MagicMock
from pathlib import Path

# Add scripts directory to path to import sync-compozy-tasks
sys.path.insert(0, str(Path(__file__).parent.parent))
sync_module = __import__("sync-compozy-tasks")

class TestSyncCompozyTasks(unittest.TestCase):

    def setUp(self):
        self.state_map = {
            "unstarted": "todo_state_id",
            "todo": "todo_state_id",
            "started": "inprogress_state_id",
            "in progress": "inprogress_state_id",
            "completed": "done_state_id",
            "done": "done_state_id"
        }

    def test_parse_task_file(self):
        content = """---
status: pending
title: "feat(auth): add login form"
type: feature
complexity: low
dependencies: ["task_00", "task_01"]
linear_issue_id: CLE-123
---
# Description
This is a test description.
"""
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md", encoding="utf-8") as temp:
            temp.write(content)
            temp_path = temp.name

        try:
            frontmatter, body = sync_module.parse_task_file(temp_path)
            self.assertEqual(frontmatter["status"], "pending")
            self.assertEqual(frontmatter["title"], "feat(auth): add login form")
            self.assertEqual(frontmatter["type"], "feature")
            self.assertEqual(frontmatter["complexity"], "low")
            self.assertEqual(frontmatter["dependencies"], ["task_00", "task_01"])
            self.assertEqual(frontmatter["linear_issue_id"], "CLE-123")
            self.assertIn("This is a test description.", body)
        finally:
            os.unlink(temp_path)

    def test_write_task_file(self):
        frontmatter = {
            "status": "completed",
            "title": "docs: update readme",
            "dependencies": ["task_02"]
        }
        body = "\n# Readme update\nSome content here.\n"
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md", encoding="utf-8") as temp:
            temp_path = temp.name

        try:
            sync_module.write_task_file(temp_path, frontmatter, body)
            parsed_fm, parsed_body = sync_module.parse_task_file(temp_path)
            self.assertEqual(parsed_fm["status"], "completed")
            self.assertEqual(parsed_fm["title"], "docs: update readme")
            self.assertEqual(parsed_fm["dependencies"], ["task_02"])
            self.assertEqual(parsed_body, body)
        finally:
            os.unlink(temp_path)

    def test_map_status_to_state(self):
        self.assertEqual(
            sync_module.map_status_to_state("pending", self.state_map),
            "todo_state_id"
        )
        self.assertEqual(
            sync_module.map_status_to_state("in_progress", self.state_map),
            "inprogress_state_id"
        )
        self.assertEqual(
            sync_module.map_status_to_state("/", self.state_map),
            "inprogress_state_id"
        )
        self.assertEqual(
            sync_module.map_status_to_state("completed", self.state_map),
            "done_state_id"
        )

    @patch("urllib.request.urlopen")
    def test_call_linear_api_success(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({
            "data": {
                "team": {
                    "states": {
                        "nodes": [{"id": "1", "name": "Todo", "type": "unstarted"}]
                    }
                }
            }
        }).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        res = sync_module.call_linear_api("query {}", {}, "mock-api-key")
        self.assertIn("team", res)

    @patch("urllib.request.urlopen")
    def test_call_linear_api_error(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({
            "errors": [{"message": "Invalid API Key"}]
        }).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        with self.assertRaises(Exception) as context:
            sync_module.call_linear_api("query {}", {}, "mock-api-key")
        self.assertIn("Invalid API Key", str(context.exception))

if __name__ == "__main__":
    unittest.main()
