import { Injectable } from "../decorators/DependencyInjection";

@Injectable()
export class JwtService {

    /**
     * Checks the headers of a request for JWT authenticated user
     * 
     * @param headers 
     */
    resolve(headers: {[key: string]: any}) {
        if (!headers) {
            throw new Error('Unable to resolved the given headers');
        }
        if (!('Authentication' in headers)) {
            throw new Error('Missing \'Authentication\' field in headers');
        }

        console.log(`resolved: ${headers['Authentication']}`);
    }
}