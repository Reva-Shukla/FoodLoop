package com.foodloop.dao;

import com.foodloop.interfaces.GenericDAO;

import java.util.List;
import java.util.Optional;

/**
 * Abstract Generic DAO: AbstractDAO<T, ID>
 * Syllabus Concepts Demonstrated:
 *  - Java Generics: Generic type parameter T for model entity and ID for identifier
 *  - Abstraction: Defines partial implementation and common DAO behavior
 *  - Interfaces: Implements GenericDAO<T, ID>
 */
public abstract class AbstractDAO<T, ID> implements GenericDAO<T, ID> {

    @Override
    public abstract T save(T entity);

    @Override
    public abstract Optional<T> findById(ID id);

    @Override
    public abstract List<T> findAll();

    @Override
    public abstract boolean update(T entity);

    @Override
    public abstract boolean deleteById(ID id);

    // Reusable utility method demonstrating generic type safety
    protected void validateEntityNotNull(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity to persist cannot be null");
        }
    }
}
