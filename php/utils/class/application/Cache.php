<?php

class Cache
{
    private $storage = [];
    private $lastUpdate = null;

    public function set($key, $value)
    {
        $this->storage[$key] = $value;
        $this->lastUpdate = time();
    }

    public function get($key)
    {
        return $this->storage[$key] ?? null;
    }

    public function delete($key)
    {
        unset($this->storage[$key]);
    }

    public function clear()
    {
        $this->storage = [];
        $this->lastUpdate = time();
    }

    // 👉 novo método
    public function isUpdated($seconds = 60)
    {
        if ($this->lastUpdate === null) {
            return false;
        }
        return (time() - $this->lastUpdate) <= $seconds;
    }
}