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

import itertools
import logging
import os
import random
from datetime import datetime
from typing import Any, Dict, List

import jinja2
import requests
import yaml
from fetch_repos import RepositoryService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HTMLGenerator:
    def __init__(self) -> None:
        self._github_username: str = os.getenv('GITHUB_USERNAME', '')
        self._config: Dict[str, Any] = self._load_yaml('config.yaml')
        self._output_path: str = 'index.html'

        version = self._config.get('site', {}).get('version', 'default')
        template_path = f"./templates/{version}"
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Template folder not found: {template_path}")
        self._env: jinja2.Environment = jinja2.Environment(
            loader=jinja2.FileSystemLoader(template_path)
        )
        self._env.globals.update(zip=zip)
        try:
            self._card_template: jinja2.Template = self._env.get_template(f"card_template.html")
            self._site_template: jinja2.Template = self._env.get_template(f"site_template.html")
        except jinja2.TemplateNotFound:
            raise FileNotFoundError("Template file not found")

    def _load_yaml(self, file: str) -> Dict[str, Any]:
        with open(file, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)

    def _get_github_user_info(self, username: str) -> Dict[str, Any]:
        url = f'https://api.github.com/users/{username}'
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f'Error fetching GitHub user info: {e}')
            return {}

    def _get_random_images(self, theme: str) -> Dict[str, List[Any]]:
        images_ref = self._load_yaml('assets/images.yaml')
        images_list = images_ref.get(theme.capitalize(), [])
        if not images_list:
            logger.error(f'No images found for theme: {theme}')
            return {'urls': [], 'display_urls': [], 'authors': []}
        else:
            logger.info(f'Found {len(images_list)} images for theme: {theme}')

        random.shuffle(images_list)
        urls = [image.get('url', '') for image in images_list]
        display_urls = [image.get('display_url', '') for image in images_list]
        authors = [image.get('author', '') for image in images_list]
        return {
            'urls': urls,
            'display_urls': display_urls,
            'authors': authors
        }

    def _get_random_image_data(self, cycles: Dict[str, Any]) -> Dict[str, str]:
        return {
            "image": next(cycles["image"]),
            "display_url": next(cycles["display_url"]),
            "author": next(cycles["author"])
        }

    def _use_repo_image(self, repo: Dict[str, Any]) -> Dict[str, str]:
        return {
            "image": repo.get('image', ''),
            "display_url": '',
            "author": ''
        }

    def _render_cards(self, repos: List[Dict[str, Any]]) -> str:
        random_image_enabled = self._config.get('repos', {}).get('random_image', True)
        theme = self._config.get('repos', {}).get('random_image_theme', 'Minimal')

        images_data = self._get_random_images(theme) if random_image_enabled else None
        cycles = None
        if images_data is not None:
            cycles = {
                "image": itertools.cycle(images_data['urls']),
                "display_url": itertools.cycle(images_data['display_urls']),
                "author": itertools.cycle(images_data['authors'])
            }
        else:
            logger.info('Random images disabled, using repo images')

        return ''.join(
            self._card_template.render(
                repo=repo,
                url=repo.get('homepage') or repo.get('page_url', ''),
                random_image_enabled=random_image_enabled,
                image_data=self._use_repo_image(repo) if cycles is None else self._get_random_image_data(cycles)
            ) for repo in repos
        )

    def generate_html(self) -> None:
        repo_service = RepositoryService()
        repo_data = repo_service.get_repos(self._config)
        repos = repo_data.get("all", [])
        filters = repo_data.get("filters", [])

        cards_html = self._render_cards(repos)

        github_info = self._get_github_user_info(self._github_username)
        user_img = self._config.get('site', {}).get('picture_path') or github_info.get('avatar_url', '')

        full_html = self._site_template.render(
            version=self._config.get('site', {}).get('version', 'v1'),
            build_time=datetime.now().strftime('%Y-%m-%d'),
            theme=self._config.get('site', {}).get('theme', 'light'),
            site_icon=self._config.get('site', {}).get('site_icon', ''),
            username=self._github_username,
            email=github_info.get('email', ''),
            title=self._config.get('site', {}).get('title', '').replace('GITHUB_USERNAME', self._github_username),
            description=self._config.get('site', {}).get('description', ''),
            user_img=user_img if self._config.get('site', {}).get('show_picture', False) else '',
            cards_html=cards_html,
            sort_key=self._config.get('repos', {}).get('sort', {}).get('key', 'stars'),
            filters=filters,
            footer={
                'show': self._config.get('footer', {}).get('show', True),
                'icons': self._config.get('footer', {}).get('icons', []),
                'href': self._config.get('footer', {}).get('href', [])
            }
        )

        with open(self._output_path, 'w', encoding='utf-8') as output_file:
            output_file.write(full_html)


if __name__ == '__main__':
    generator = HTMLGenerator()
    generator.generate_html()
