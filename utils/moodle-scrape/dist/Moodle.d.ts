import { Course, Task, User, Fetch } from './types/types';
export declare class Moodle {
    url: string;
    fetch: Fetch;
    cookies: string | undefined;
    user: User | null;
    courses: Array<Course>;
    tasks: Array<Task>;
    /**
     * Creates a new scraper instance for a certain Moodle site
     * @param { Fetch }     fetch   The fetch method to use (e.g. undici or the built-in global fetch)
     * @param { string }    url     URL of the Moodle site
     * @example const moodle = new Moodle(fetch, "https://examplesite.com");
     */
    constructor(fetch: Fetch, url: string);
    /**
     *
     * @param { string } username
     * @param { string } password
     * @param { boolean } refresh Whether to call Moodle.refresh() automatically after logging in. True by default.
     */
    login(username: string, password: string, refresh?: boolean): Promise<boolean>;
    /**
     * Fetches the user data and stores them in the Moodle instance
     * @param cookies optional
     */
    refresh(cookies?: string | undefined): Promise<boolean>;
}
