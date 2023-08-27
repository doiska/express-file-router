import {readdir} from 'node:fs/promises';
import * as path from "path";
import * as url from "url";

const VALID_HTTP_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

type HttpMethod = typeof VALID_HTTP_METHODS[number];

type Router = {
    [K in HttpMethod]?: (route: string, handler: Function) => void;
}

interface Options {
    directory: string | 'routes';
    extensions?: string[];
}

async function setupFileRouter(router: Router, options?: Options) {
    if (!router) {
        throw new Error('Router must be set up.');
    }
    const routerDirectory = path.normalize(options?.directory ?? 'routes');
    const files = await getFiles(routerDirectory);

    console.log(`[File Router] Using "${routerDirectory}" as route directory.`);

    for (const file of files) {
        const {href: handlerPath} = url.pathToFileURL(path.join(file));

        const handler = await import(handlerPath);

        const cleanedDirectory = path.parse(file).dir
            .replace(routerDirectory, '')
            .replace('\\', '/');

        const routeDirectory = cleanedDirectory.trim() === '' ? '/' : cleanedDirectory;
        const methods = Object.keys(handler)
            .filter(handlerMethod => VALID_HTTP_METHODS.includes(handlerMethod as HttpMethod)) as HttpMethod[];

        methods.forEach(method => {
            createRoute(router, routeDirectory, method, handler[method]);
        })
    }
}

async function getFiles(dir: string, extensions = ['ts', 'js']) {
    const files = await readdir(dir, {withFileTypes: true});

    const filePaths: string[] = [];

    for (let file of files) {
        if (file.isDirectory()) {
            const subDirFiles = await getFiles(path.join(dir, file.name), extensions);
            filePaths.push(...subDirFiles);  // Using the spread operator here
        } else if (extensions.some(ext => file.name.endsWith(`.${ext}`))) {
            filePaths.push(path.join(dir, file.name));
        }
    }

    return filePaths;
}

function createRoute(router: Router, route: string, method: HttpMethod, handler: Function) {
    router[method.toLowerCase() as HttpMethod]?.(route, handler);

    console.log(`[File Router] Created route ${route} with ${method.toUpperCase()} method.`)
}

export { setupFileRouter }