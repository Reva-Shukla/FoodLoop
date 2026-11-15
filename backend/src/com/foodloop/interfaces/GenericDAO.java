package com.foodloop.interfaces;

import java.util.List;
import java.util.Optional;

/**
 * Interface: GenericDAO<T, ID>
 * Syllabus Concept: Java Generics
 * 
 * Reusable generic data access object interface defining standard CRUD operations
 * for any persistent model type T with identifier of type ID.
 */
public interface GenericDAO<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    boolean update(T entity);
    boolean deleteById(ID id);
}
