# Server scripts

## Usage

1. Install dependencies
   ```shell
   yarn install
   ```
2. The data is available via LDF server at <http://localhost:8080/data>.
3. Generate new rankings via
   ```shell
   node generate-new-ranking.js -f ranking.nt -v
   ```
4. You find the rankings in `ranking.nt`.
