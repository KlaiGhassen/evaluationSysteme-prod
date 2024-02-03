import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    InventoryBrand,
    InventoryCategory,
    InventoryPagination,
    InventoryProduct,
    InventoryTag,
    InventoryVendor,
} from 'app/modules/admin/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class InventoryService {
    // Private
    private _classRooms: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _categories: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(
        null
    );
    private _product: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get classRooms$(): Observable<any[]> {
        return this._classRooms.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<InventoryCategory[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get product$(): Observable<any> {
        return this._product.asObservable();
    }

    /**
     * Getter for products
     */
    get products$(): Observable<any[]> {
        return this._products.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<InventoryTag[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<InventoryVendor[]> {
        return this._vendors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get brands
     */
    getClassRooms(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'class-rooms')
            .pipe(
                tap((contacts) => {
                    this._classRooms.next(contacts);
                })
            );
    }

    /**
     * Get categories
     */
    getCategories(): Observable<InventoryCategory[]> {
        return this._httpClient
            .get<InventoryCategory[]>('api/apps/ecommerce/inventory/categories')
            .pipe(
                tap((categories) => {
                    this._categories.next(categories);
                })
            );
    }

    /**
     * Get products
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getProducts(
        classRoomId: string =  'all',
        page: number = 0,
        size: number = 10,
        sort: string = 'first_name',
        order: 'asc' | 'desc' | '' = 'asc',
        search: string = ''
    ): Observable<{ pagination: any; products: any[] }> {
        return this._httpClient
            .get<{ pagination: any; products: any[] }>(
                environment.apiUrl + 'students/all-students',
                {
                    params: {
                        page: '' + page,
                        size: '' + size,
                        sort,
                        order,
                        search,
                        classRoomId,
                    },
                }
            )
            .pipe(
                tap((response) => {
                    this._pagination.next(response.pagination);
                    this._products.next(response.products);
                })
            );
    }

    /**
     * Get product by id
     */
    getProductById(id: string): Observable<InventoryProduct> {
        return this._products.pipe(
            take(1),
            map((products) => {
                // Find the product
                const product = products.find((item) => item.id === id) || null;

                // Update the product
                this._product.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {
                if (!product) {
                    return throwError(
                        'Could not found product with id of ' + id + '!'
                    );
                }

                return of(product);
            })
        );
    }

    /**
     * Create product
     */
    createProduct(data): Observable<InventoryProduct> {
        return this.products$.pipe(
            take(1),
            switchMap((products) =>
                this._httpClient
                    .post<InventoryProduct>(
                        environment.apiUrl + 'students/add-teacher',
                        data
                    )
                    .pipe(
                        map((newProduct) => {
                            // Update the products with the new product
                            this._products.next([newProduct, ...products]);

                            // Return the new product
                            return newProduct;
                        })
                    )
            )
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
    updateProduct(
        id: string,
        product: InventoryProduct
    ): Observable<InventoryProduct> {
        return this.products$.pipe(
            take(1),
            switchMap((products) =>
                this._httpClient
                    .patch<InventoryProduct>(
                        'api/apps/ecommerce/inventory/product',
                        {
                            id,
                            product,
                        }
                    )
                    .pipe(
                        map((updatedProduct) => {
                            // Find the index of the updated product
                            const index = products.findIndex(
                                (item) => item.id === id
                            );

                            // Update the product
                            products[index] = updatedProduct;

                            // Update the products
                            this._products.next(products);

                            // Return the updated product
                            return updatedProduct;
                        }),
                        switchMap((updatedProduct) =>
                            this.product$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the product if it's selected
                                    this._product.next(updatedProduct);

                                    // Return the updated product
                                    return updatedProduct;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the product
     *
     * @param id
     */
    deleteProduct(id: string): Observable<boolean> {
        return this.products$.pipe(
            take(1),
            switchMap((products) =>
                this._httpClient
                    .delete('api/apps/ecommerce/inventory/product', {
                        params: { id },
                    })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted product
                            const index = products.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the product
                            products.splice(index, 1);

                            // Update the products
                            this._products.next(products);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<InventoryTag[]> {
        return this._httpClient
            .get<InventoryTag[]>('api/apps/ecommerce/inventory/tags')
            .pipe(
                tap((tags) => {
                    this._tags.next(tags);
                })
            );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: InventoryTag): Observable<InventoryTag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .post<InventoryTag>('api/apps/ecommerce/inventory/tag', {
                        tag,
                    })
                    .pipe(
                        map((newTag) => {
                            // Update the tags with the new tag
                            this._tags.next([...tags, newTag]);

                            // Return new tag from observable
                            return newTag;
                        })
                    )
            )
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: InventoryTag): Observable<InventoryTag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .patch<InventoryTag>('api/apps/ecommerce/inventory/tag', {
                        id,
                        tag,
                    })
                    .pipe(
                        map((updatedTag) => {
                            // Find the index of the updated tag
                            const index = tags.findIndex(
                                (item) => item.id === id
                            );

                            // Update the tag
                            tags[index] = updatedTag;

                            // Update the tags
                            this._tags.next(tags);

                            // Return the updated tag
                            return updatedTag;
                        })
                    )
            )
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .delete('api/apps/ecommerce/inventory/tag', {
                        params: { id },
                    })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted tag
                            const index = tags.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the tag
                            tags.splice(index, 1);

                            // Update the tags
                            this._tags.next(tags);

                            // Return the deleted status
                            return isDeleted;
                        }),
                        filter((isDeleted) => isDeleted),
                        switchMap((isDeleted) =>
                            this.products$.pipe(
                                take(1),
                                map((products) => {
                                    // Iterate through the contacts
                                    products.forEach((product) => {
                                        const tagIndex = product.tags.findIndex(
                                            (tag) => tag === id
                                        );

                                        // If the contact has the tag, remove it
                                        if (tagIndex > -1) {
                                            product.tags.splice(tagIndex, 1);
                                        }
                                    });

                                    // Return the deleted status
                                    return isDeleted;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Get vendors
     */
    getVendors(): Observable<InventoryVendor[]> {
        return this._httpClient
            .get<InventoryVendor[]>('api/apps/ecommerce/inventory/vendors')
            .pipe(
                tap((vendors) => {
                    this._vendors.next(vendors);
                })
            );
    }

    /**
     * Create contact
     */
    createContactFromFile(teacher: any): Observable<any> {
        return this.products$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<any>(
                        environment.apiUrl + 'students/fileStudents',
                        teacher
                    )
                    .pipe(
                        map((response) => {
                            // Update the contacts with the new contact
                            this._pagination.next(response.pagination);
                            this._products.next(response.products);
                            // Return the new contact
                        })
                    )
            )
        );
    }
}
