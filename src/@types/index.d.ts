/**
 * Type representing possible sort order values.
 */
type SortOrder = 'ascend' | 'descend' | 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1;


// Define the type for FindOperatorQB
interface FindOperatorQB {
    query: string;
    parameters?: any;
}