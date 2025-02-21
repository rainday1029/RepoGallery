# ------------------------------------------------------------------------------
# Copyright 2025 Ting-An Cheng
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------

import logging
import os
import re
from collections import Counter
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RepoFetcher:
    def __init__(self, username: str, token: Optional[str] = None) -> None:
        self._username: str = username
        self._token: Optional[str] = token
        self._headers: Dict[str, str] = {'Authorization': f'token {self._token}'} if self._token else {}

    def _fetch_readme_image(self, repo_name: str) -> Optional[str]:
        for branch in ['main', 'master']:
            url = f'https://raw.githubusercontent.com/{self._username}/{repo_name}/{branch}/README.md'
            logger.info(f'Fetching README from URL: {url}')
            try:
                response = requests.get(url, headers=self._headers, timeout=5)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                logger.warning(f'Failed to fetch README.md from {branch} branch: {e}')
                continue

            markdown_match = re.search(r'!\[.*?\]\((.*?)\)', response.text)
            html_match = re.search(r'<img\s+[^>]*src="([^"]+)"', response.text)

            if markdown_match:
                image_url = markdown_match.group(1)
            elif html_match:
                image_url = html_match.group(1)
            else:
                logger.info('No image found in README.md')
                return None

            if not image_url.startswith('http'):
                image_url = f'https://raw.githubusercontent.com/{self._username}/{repo_name}/{branch}/{image_url.lstrip("/")}'

            logger.info(f'Found image URL: {image_url}')
            return image_url
        return None

    def _get_repo_prs(self, repo_name: str) -> int:
        url = f'https://api.github.com/repos/{self._username}/{repo_name}/pulls'
        try:
            response = requests.get(url, headers={'Accept': 'application/vnd.github.v3+json'}, timeout=5)
            response.raise_for_status()
            return len(response.json())
        except requests.exceptions.RequestException as e:
            logger.error(f'Error fetching PRs for {repo_name}: {e}')
            return 0

    @staticmethod
    def _format_date(date_str: str) -> str:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%SZ').strftime('%Y-%m-%d %H:%M:%S') if date_str else ''

    def _fetch_repo_data(self, repo: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'name': repo.get('name', ''),
            'description': repo.get('description') or "This repo is awesome! But it doesn't have a description yet.",
            'repo_url': repo.get('html_url', ''),
            'repo_topics': repo.get('topics', []),
            'language': repo.get('language') or '',
            'stars': repo.get('stargazers_count', 0),
            'forks': repo.get('forks_count', 0),
            'prs': self._get_repo_prs(repo.get('name', '')),
            'is_fork': repo.get('fork', False),
            'image': self._fetch_readme_image(repo.get('name', '')) or '',
            'created_at': self._format_date(repo.get('created_at', '')),
            'updated_at': self._format_date(repo.get('updated_at', '')),
            'pushed_at': self._format_date(repo.get('pushed_at', '')),
            'has_pages': repo.get('has_pages', False),
            'page_url': f"https://{self._username}.github.io/{repo.get('name', '')}/" if repo.get('has_pages', False) else '',
            'homepage': repo.get('homepage', ''),
            'license': repo['license']['name'] if repo.get('license') else 'No License',
            'license_url': f"https://img.shields.io/github/license/{repo['owner']['login']}/{repo['name']}?style=social",
            'size': repo.get('size', 0),
            'visibility': repo.get('visibility', ''),
            'has_issues': repo.get('has_issues', False),
            'open_issues_count': repo.get('open_issues_count', 0),
            'has_discussions': repo.get('has_discussions', False),
            'contributors_url': repo.get('contributors_url', '')
        }

    def fetch_repos(self) -> List[Dict[str, Any]]:
        url = f'https://api.github.com/users/{self._username}/repos'
        try:
            response = requests.get(url, headers=self._headers, timeout=5)
            response.raise_for_status()
        except requests.RequestException as e:
            raise Exception(f'Failed to fetch repos: {e}')
        repos = response.json()
        return [self._fetch_repo_data(repo) for repo in repos]


class RepositoryService:
    def __init__(self) -> None:
        self._username: str = os.getenv('GITHUB_USERNAME', '')
        self._token: Optional[str] = os.getenv('GITHUB_TOKEN', None)
        self._fetcher = RepoFetcher(self._username, self._token)

    def get_repos(self, config: Dict[str, Any]) -> Dict[str, Any]:
        repos = self._fetcher.fetch_repos()
        repos = self._filter_repos(repos, config)
        repos = self._sort_repos(repos, config['repos']['sort']['key'], config['repos']['sort']['descending'])
        repos = self._limit_repos(repos, config)
        filters = self._get_filters(repos)
        return {
            "all": repos,
            "filters": filters
        }

    def _filter_repos(self, repos: List[Dict[str, Any]], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not config['repos'].get('show_forks', False):
            repos = [r for r in repos if not r.get('is_fork', False)]
        excluded = [repo.replace('GITHUB_USERNAME', self._username) for repo in config['repos'].get('exclude', [])]
        exclude_patterns = config['repos'].get('exclude_patterns', [])
        return [
            repo for repo in repos
            if not any(re.match(pattern, repo.get('name', '')) for pattern in exclude_patterns) and repo.get('name', '') not in excluded
        ]

    def _sort_repos(self, repos: List[Dict[str, Any]], sort_key: str, reverse: bool) -> List[Dict[str, Any]]:
        return sorted(repos, key=lambda r: (r.get(sort_key) is not None, r.get(sort_key)), reverse=reverse)

    def _limit_repos(self, repos: List[Dict[str, Any]], config: Dict[str, Any]) -> List[Dict[str, Any]]:
        limit = config['repos'].get('limit', 0)
        return repos[:limit] if limit > 0 else repos

    def _get_filters(self, repos: List[Dict[str, Any]]) -> List[str]:
        topics = []
        for repo in repos:
            topics.extend(repo.get('repo_topics', []))
            if repo.get('language'):
                topics.append(repo['language'])

        counter = Counter(topics)
        most_common = counter.most_common(4)
        return [item[0] for item in most_common if item[0]]
