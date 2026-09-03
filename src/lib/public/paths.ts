/** The two pages reached only from an emailed link; the mobile consult bar and robots.txt read these. */
export const SIGN_PATH = '/sign/';
export const SCHEDULE_PATH = '/schedule/';
export const PUBLIC_LINK_PATHS = [SIGN_PATH, SCHEDULE_PATH] as const;
