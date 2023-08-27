## Express File-based Router (NextJS style)
Simplify your Express routing. Organize routes using file and directory structures, and let this tool auto-register them.

### Installation

```bash
npm install express-router-fs --save
```

### Quick Start
Just like in NextJS, your routes are declared based on their directory and file structure. Ensure each directory has an index file.
In your main app file (where your Express app is initialized):

```ts

const app = express();

setupFileRouter(app, {
    directory: 'routes',
    extensions: ['.ts', '.js']
});
```
Directory example:

```lua
routes/
|-- index.ts
|-- posts/
|-- |-- index.ts
```

The handler methods are declarated using ```exported functions```, for example:

```ts
export function GET(request: Request, response: Response) {
    console.log('Received GET request!')
}

export function POST(request: Request, response: Response) {
    console.log('Received POST request!')
}
```